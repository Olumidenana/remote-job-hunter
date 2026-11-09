import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'olumideadeyeminana@gmail.com',
    pass: 'vbfzavxeehgfwmfk',
  },
});

const cvPath = path.join(process.cwd(), 'public', 'cv', 'Olumide_Adeyemi-Nana_FullStack_Systems_Architect_CV.pdf');
console.log('Attaching CV from:', cvPath, 'Exists:', fs.existsSync(cvPath));

async function main() {
  const info = await transporter.sendMail({
    from: '"Olumide Adeyemi-Nana" <olumideadeyeminana@gmail.com>',
    to: 'olumideadeyeminana@gmail.com',
    subject: '🚀 Job Engine Connected: Direct Recruiter Dispatch is LIVE (PDF CV Verified)',
    text: 'Hello Olumide,\n\nYour Google App Password has been successfully authenticated by Google!\n\nThe engine is now armed to dispatch directly into external recruiters inboxes from your real Gmail address with your tailored PDF CV attached.\n\nBest regards,\nOlumide Adeyemi-Nana Systems Hunter',
    attachments: [
      {
        filename: 'Olumide_Adeyemi-Nana_FullStack_Systems_Architect_CV.pdf',
        path: cvPath,
      },
    ],
  });

  console.log('🎉 SUCCESS: Test verification email delivered directly to your inbox!');
  console.log('Message ID:', info.messageId);
}

main().catch(console.error);
