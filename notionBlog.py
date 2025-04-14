import os
import json
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
from notion_client import Client
from notion_client.helpers import collect_paginated_api
import requests
import markdown
import jinja2

# Load environment variables
load_dotenv()
notion = Client(auth=os.environ["NOTION_TOKEN"])
database_id = os.environ["NOTION_DATABASE_ID"]

# Create output directories
# Create output directories
blog_dir = Path("blog")
blog_dir.mkdir(exist_ok=True)
posts_dir = blog_dir / "posts"
posts_dir.mkdir(exist_ok=True)
assets_dir = blog_dir / "assets"
assets_dir.mkdir(exist_ok=True)
images_dir = assets_dir / "images"
images_dir.mkdir(exist_ok=True)

# Set up Jinja2 for templating
template_loader = jinja2.FileSystemLoader(searchpath="templates")
template_env = jinja2.Environment(loader=template_loader)
post_template = template_env.get_template("post.html")
index_template = template_env.get_template("index.html")

def get_blog_posts():
    """Fetch all blog posts from Notion database"""
    posts = collect_paginated_api(
        notion.databases.query,
        database_id=database_id,
        sorts=[{"property": "Published", "direction": "descending"}]
    )
    
    # If posts is already a list, return it directly
    if isinstance(posts, list):
        return posts
    # If posts is a dictionary with a "results" key, return posts["results"]
    elif isinstance(posts, dict) and "results" in posts:
        return posts["results"]
    # Otherwise, return an empty list
    else:
        print("Warning: Unexpected response format from Notion API")
        return []

def process_notion_blocks(block_id):
    """Process Notion blocks and convert to HTML content"""
    blocks = collect_paginated_api(
        notion.blocks.children.list,
        block_id=block_id
    )
    
    # Process blocks into HTML
    html_content = ""
    
    # Handle different response formats
    block_list = []
    if isinstance(blocks, list):
        block_list = blocks
    elif isinstance(blocks, dict) and "results" in blocks:
        block_list = blocks["results"]
    else:
        print(f"Warning: Unexpected block format for block_id: {block_id}")
        return html_content
    
    for block in block_list:
        try:
            block_type = block["type"]
            
            if block_type == "paragraph":
                rich_text = block["paragraph"]["rich_text"]
                if rich_text:
                    text = "".join([text["plain_text"] for text in rich_text])
                    html_content += f"<p>{text}</p>\n"
                else:
                    html_content += "<p></p>\n"
                    
            elif block_type == "heading_1":
                text = "".join([text["plain_text"] for text in block["heading_1"]["rich_text"]])
                html_content += f"<h2>{text}</h2>\n"
                
            elif block_type == "heading_2":
                text = "".join([text["plain_text"] for text in block["heading_2"]["rich_text"]])
                html_content += f"<h3>{text}</h3>\n"
                
            elif block_type == "heading_3":
                text = "".join([text["plain_text"] for text in block["heading_3"]["rich_text"]])
                html_content += f"<h4>{text}</h4>\n"
                
            elif block_type == "bulleted_list_item":
                text = "".join([text["plain_text"] for text in block["bulleted_list_item"]["rich_text"]])
                html_content += f"<ul><li>{text}</li></ul>\n"
                
            elif block_type == "numbered_list_item":
                text = "".join([text["plain_text"] for text in block["numbered_list_item"]["rich_text"]])
                html_content += f"<ol><li>{text}</li></ol>\n"
                
            elif block_type == "to_do":
                checked = block["to_do"]["checked"]
                text = "".join([text["plain_text"] for text in block["to_do"]["rich_text"]])
                checkbox = "✓" if checked else "☐"
                html_content += f"<div class='todo-item'><span class='checkbox'>{checkbox}</span> {text}</div>\n"
                
            elif block_type == "toggle":
                summary = "".join([text["plain_text"] for text in block["toggle"]["rich_text"]])
                html_content += f"<details><summary>{summary}</summary><div>"
                if block.get("has_children", False):
                    html_content += process_notion_blocks(block["id"])
                html_content += "</div></details>\n"
                
            elif block_type == "code":
                code = "".join([text["plain_text"] for text in block["code"]["rich_text"]])
                language = block["code"].get("language", "")
                html_content += f"<pre><code class='language-{language}'>{code}</code></pre>\n"
                
            elif block_type == "quote":
                text = "".join([text["plain_text"] for text in block["quote"]["rich_text"]])
                html_content += f"<blockquote>{text}</blockquote>\n"
                
            elif block_type == "divider":
                html_content += "<hr>\n"
                
            elif block_type == "image":
                caption = ""
                if "caption" in block["image"] and block["image"]["caption"]:
                    caption = "".join([text["plain_text"] for text in block["image"]["caption"]])
                
                if "external" in block["image"] and block["image"]["external"]:
                    image_url = block["image"]["external"]["url"]
                    html_content += f"<figure><img src='{image_url}' alt='{caption}'>"
                    if caption:
                        html_content += f"<figcaption>{caption}</figcaption>"
                    html_content += "</figure>\n"
                elif "file" in block["image"] and block["image"]["file"]:
                    image_url = block["image"]["file"]["url"]
                    html_content += f"<figure><img src='{image_url}' alt='{caption}'>"
                    if caption:
                        html_content += f"<figcaption>{caption}</figcaption>"
                    html_content += "</figure>\n"
            
            # Handle other block types as needed
            else:
                print(f"Unhandled block type: {block_type}")
                
        except Exception as e:
            print(f"Error processing block: {e}")
            continue
        
    return html_content

def download_image(url, filename):
    """Download image from Notion and save locally"""
    response = requests.get(url)
    if response.status_code == 200:
        with open(filename, 'wb') as f:
            f.write(response.content)
        return True
    return False

def generate_static_site():
    """Generate static HTML files from Notion content"""
    posts = get_blog_posts()
    post_summaries = []
    
    # Process each post
    for post in posts:
        # Extract post properties
        properties = post["properties"]
        title = properties["Title"]["title"][0]["plain_text"] if properties["Title"]["title"] else "Untitled"
        slug = properties.get("Slug", {}).get("rich_text", [{}])[0].get("plain_text", "")
        
        if not slug:
            # Generate slug from title if not provided
            slug = title.lower().replace(" ", "-").replace("?", "").replace("!", "").replace(".", "")
        
        published_date = properties.get("Published", {}).get("date", {}).get("start", datetime.now().isoformat())
        
        # Get post content
        content_html = process_notion_blocks(post["id"])
        
        # Create post file
        post_path = posts_dir / f"{slug}.html"
        with open(post_path, "w") as f:
            f.write(post_template.render(
                title=title,
                content=content_html,
                date=published_date,
                root_path="/blog"
            ))
        
        # Add to summaries for index page with full content
        post_summaries.append({
            "title": title,
            "slug": slug,
            "date": published_date,
            "url": f"/blog/posts/{slug}.html",
            "content": content_html  # Include the full content
        })
    
    # Generate index page with all posts
    with open(blog_dir / "index.html", "w") as f:
        f.write(index_template.render(
            posts=post_summaries,
            root_path="/blog"
        ))
    
    print(f"Generated {len(posts)} blog posts in /blog directory")

if __name__ == "__main__":
    generate_static_site()