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
output_dir = Path("public")
output_dir.mkdir(exist_ok=True)
blog_dir = output_dir / "blog"
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
    return posts["results"]

def process_notion_blocks(block_id):
    """Process Notion blocks and convert to HTML content"""
    blocks = collect_paginated_api(
        notion.blocks.children.list,
        block_id=block_id
    )
    
    # Process blocks into HTML (simplified)
    html_content = ""
    for block in blocks["results"]:
        block_type = block["type"]
        if block_type == "paragraph":
            text = "".join([text["plain_text"] for text in block["paragraph"]["rich_text"]])
            html_content += f"<p>{text}</p>\n"
        elif block_type == "heading_1":
            text = "".join([text["plain_text"] for text in block["heading_1"]["rich_text"]])
            html_content += f"<h1>{text}</h1>\n"
        elif block_type == "heading_2":
            text = "".join([text["plain_text"] for text in block["heading_2"]["rich_text"]])
            html_content += f"<h2>{text}</h2>\n"
        elif block_type == "heading_3":
            text = "".join([text["plain_text"] for text in block["heading_3"]["rich_text"]])
            html_content += f"<h3>{text}</h3>\n"
        elif block_type == "bulleted_list_item":
            text = "".join([text["plain_text"] for text in block["bulleted_list_item"]["rich_text"]])
            html_content += f"<li>{text}</li>\n"
        elif block_type == "numbered_list_item":
            text = "".join([text["plain_text"] for text in block["numbered_list_item"]["rich_text"]])
            html_content += f"<li>{text}</li>\n"
        elif block_type == "image":
            if "external" in block["image"]:
                image_url = block["image"]["external"]["url"]
            else:
                image_url = block["image"]["file"]["url"]
            
            # Download the image
            image_filename = f"image_{block['id'].replace('-', '')}.jpg"
            image_path = images_dir / image_filename
            download_image(image_url, image_path)
            
            # Add to HTML
            alt_text = "".join([text["plain_text"] for text in block["image"].get("caption", [])])
            html_content += f'<img src="/blog/assets/images/{image_filename}" alt="{alt_text}" class="blog-image">\n'
        
        # You would add more block types as needed
        
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
        
        # Add to summaries for index page
        post_summaries.append({
            "title": title,
            "slug": slug,
            "date": published_date,
            "url": f"/blog/posts/{slug}.html",
            # You could add a summary/excerpt here too
        })
    
    # Generate index page with all posts
    with open(blog_dir / "index.html", "w") as f:
        f.write(index_template.render(
            posts=post_summaries,
            root_path="/blog"
        ))
    
    # Copy static assets (CSS, JavaScript, etc.)
    # Example:
    # shutil.copy("templates/styles.css", assets_dir / "styles.css")
    
    print(f"Generated {len(posts)} blog posts in /blog directory")

if __name__ == "__main__":
    generate_static_site()