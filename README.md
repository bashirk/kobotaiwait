# Next.js + Google Sheets wait list page

![Page preview](./preview.png)

## Description:

This project is a fork of the [Next.js + EmailOctopus wait list page](https://github.com/soufianeelc/nextjs-waitlist-page) by Soufiane Elc, modified to submit emails to a Google Sheet instead of EmailOctopus. It is designed to capture potential customer emails and store them directly in a Google Sheet.

- Designed using Figma
- Built using powerful technologies: Next.js, Typescript, and Tailwind CSS.
- Mobile responsive

## Getting Started

  ```bash
  git clone https://github.com/bashirk/nextjs-waitlist-page.git
  ```

- Install dependencies
  ```bash
  bun install
  ```
- Set up Google Sheets API:

  - Create a Google Cloud project and enable the Google Sheets API.
  - Set up a service account, download the credentials JSON file, and copy the private key value and paste it in the `GOOGLE_PRIVATE_KEY` variable in the `.env` file, repeat the same for the `GOOGLE_CLIENT_EMAIL` variable.
  - Share the target Google Sheet with the service account email.

## Deployment

Once you have successfully deployed the project, ensure to set the environment variables as outlined in the `.env.example` file on your hosting platform, including your Google Sheets credentials and spreadsheet ID.

## Acknowledgements
This project was originally forked from [Next.js + EmailOctopus](https://github.com/soufianeelc/nextjs-waitlist-page) wait list page by Soufiane Elc, and adapted to use Google Sheets for data submission.

## Support
If you appreciate the original work, you can show your support by [buying Soufiane Elc a coffee](https://www.buymeacoffee.com/soufianeelc). Your contribution helps keep the momentum going and fuels the creation of more content.

Thank you for your generosity! ☕
