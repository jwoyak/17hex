# Content Creator Portfolio Site

This is a static HTML website for a content creator, featuring sections for showcasing work and a blog powered by Notion.

## Setup Instructions

### 1. Customize the HTML/CSS
- Open `index.html` and replace all placeholder text with your own content.
- Update links, project descriptions, and contact information.
- Optionally, modify the `styles.css` file to match your preferred color scheme and design aesthetic.

### 2. Set Up Your Notion Blog
1. Create a public Notion page that will serve as your blog.
2. Make the page public by clicking "Share" and turning on "Share to web".
3. Copy the public link.
4. In `index.html`, replace `https://your-notion-blog-url-here.notion.site` with your public Notion page URL.

### 3. Deploy to Firebase

#### Prerequisites
- [Node.js](https://nodejs.org/) installed on your computer
- Firebase account (sign up at [firebase.google.com](https://firebase.google.com/))

#### Steps
1. Install Firebase CLI globally:
   ```
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```
   firebase login
   ```

3. Initialize your Firebase project (if you haven't already):
   ```
   firebase init
   ```
   - Select "Hosting" when prompted
   - Choose your Firebase project or create a new one
   - Set the public directory to "." (current directory)
   - Configure as a single-page app: "No"
   - Set up automatic builds: "No"

4. Update `.firebaserc` with your project ID:
   ```json
   {
     "projects": {
       "default": "your-project-id-here"
     }
   }
   ```

5. Deploy to Firebase:
   ```
   firebase deploy
   ```

6. Your site will be live at `https://your-project-id.web.app`

## Maintenance

### Updating Content
- To update the main website content, edit the `index.html` file and redeploy.
- To update the blog, simply make changes in your Notion page - the iframe will automatically show the latest content.

### Troubleshooting
- If your Notion iframe doesn't load, check that your Notion page is properly set to "Share to web".
- Some browsers block iframes due to security settings. You may need to add X-Frame-Options headers if you're having issues.

## Further Customization
- Add custom fonts by updating the Google Fonts link in the header
- Integrate analytics by adding Google Analytics or Firebase Analytics
- Add a custom domain by configuring it in the Firebase console

## License
[Your License Information]