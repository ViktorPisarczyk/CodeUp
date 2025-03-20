import React from "react";
import AsideMenu from "../components/AsideMenu";


const Privacy = () => {
   
  return (
   
    <div className="bg-(--primary)  min-h-screen flex flex-row items   ">
      <AsideMenu />
       
          <div className="flex flex-col items-left text-center max-w-4xl mx-auto">
           
            <h1 className="text-2xl font-bold mt-4">Privacy Policy</h1>
            <p className="text-light-600 mt-2">Last Updated: 25.03.2025</p>
            <p className="text-light-600 mt-2 text-center ">
              Welcome to<div className="relative inline-block text-xl ">
      <span>CODE</span>
      <span className="relative top-[-8px] right-[-3px] text-sm text-light-500">
        up
      </span>
    </div>.  Your privacy is important to us, and this Privacy Policy explains how we collect, <br /> use, disclose, and safeguard your information when you visit our website [YourWebsiteURL.com] (the "Website").
            </p>
            <p className="text-light-600 mt-2 text-left">
              By using our Website, you agree to the terms outlined in this Privacy Policy.
            </p>
            <h2 className="text-xl font-semibold mt-4">1. Information We Collect</h2>
            <p className="text-light-600 mt-2 text-left">
              We collect various types of information to provide and improve our services:
            </p>
            <h3 className="text-lg font-medium mt-2 ">1.1 Personal Information</h3>
            <ul className="list-disc list-inside text-light-600 text-left">
              <li>Name, username, email address, and profile details when you create an account.</li>
              <li>Communication data, such as messages exchanged with other users.</li>
            </ul>
            <h3 className="text-lg font-medium mt-2">1.2 Technical and Usage Information</h3>
            <ul className="list-disc list-inside text-light-600 text-left">
              <li>IP address, browser type, operating system, and access times.</li>
              <li>Activity on the Website, including pages visited and interactions.</li>
              <li>Cookies and tracking technologies to enhance user experience.</li>
            </ul>
            <h3 className="text-lg font-medium mt-2">1.3 Content You Share</h3>
            <ul className="list-disc list-inside text-light-600 text-left">
              <li>Code snippets, project descriptions, and any other content you post.</li>
              <li>Comments, reactions, and other interactions on the platform.</li>
            </ul>
            <h2 className="text-xl font-semibold mt-4">2. How We Use Your Information</h2>
            <p className="text-light-600 mt-2 text-left">
              We use your information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-light-600 text-left">
              <li>To provide and manage your account.</li>
              <li>To facilitate code sharing and collaboration with other users.</li>
              <li>To improve our Website and develop new features.</li>
              <li>To personalize your experience and offer relevant content.</li>
              <li>To communicate updates, security alerts, and support messages.</li>
              <li>To enforce our Terms of Service and prevent misuse of the platform.</li>
            </ul>
            <h2 className="text-xl font-semibold mt-4">3. How We Share Your Information</h2>
            <p className="text-light-600 mt-2 text-left">
              We do not sell your personal data. However, we may share information:
            </p>
            <ul className="list-disc list-inside text-light-600 text-left">
              <li>With other users: Your profile and shared content may be visible to others.</li>
              <li>With service providers: Third-party companies that assist with hosting, analytics, and security.</li>
              <li>For legal reasons: If required by law, or to protect rights, property, and safety.</li>
              <li>In case of a business transfer: If our platform is acquired or merged with another entity.</li>
            </ul>
            <h2 className="text-xl font-semibold mt-4">4. Data Security</h2>
            <p className="text-light-600 mt-2 text-left">
              We implement industry-standard measures to protect your data. However, no system is 100% secure, and we encourage you to use strong passwords and be cautious with personal information.
            </p>
            <h2 className="text-xl font-semibold mt-4">5. Your Rights and Choices</h2>
            <p className="text-light-600 mt-2 text-left">
              Depending on your location, you may have rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside text-light-600 text-left">
              <li>Access, update, or delete your account information.</li>
              <li>Opt-out of marketing emails.</li>
              <li>Adjust cookie preferences.</li>
            </ul>
            <p className="text-light-600 mt-2 text-left">
              To exercise these rights, contact us at <a href="noreply.codeup@gmail.com">noreply.codeup@gmail.com</a>.
            </p>
            <h2 className="text-xl font-semibold mt-4">6. Third-Party Links</h2>
            <p className="text-light-600 mt-2 text-left">
              Our Website may contain links to third-party websites. We are not responsible for their privacy policies, so please review their terms separately.
            </p>
            <h2 className="text-xl font-semibold mt-4">7. Updates to This Policy</h2>
            <p className="text-light-600 mt-2 text-left">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with a new "Last Updated" date.
            </p>
            <h2 className="text-xl font-semibold mt-4">8. Contact Us</h2>
            <p className="text-light-600 mt-2 text-left">
              If you have any questions about this Privacy Policy, you can reach us at:
            </p>
            <p className="text-light-600 mt-2 text-center">
            <span>CODE</span>
      <span className="relative top-[-5px] right-[-8px] text-sm text-light-500">
        up
      </span>
              <br /><a href="noreply.codeup@gmail.com">noreply.codeup@gmail.com</a>
              <br />[Your Website URL]
            </p>
          </div>
       
     
    </div>
  );
};


export default Privacy;