import React from "react";
import { useContext } from "react";
import AsideMenu from "../components/AsideMenu";
import logoDM from "../assets/newLogoDM.png";
import logoLM from "../assets/newLogoLM.png";
import { MyContext } from "../context/ThemeContext";
import Viktor from "../assets/viktor.png";
import Nausica from "../assets/20250314_094934.jpg";
import Nikolas from "../assets/nikolas.jpeg";
import Quentin from "../assets/quntin.jpg";

const AboutPage = () => {
  const { darkMode } = useContext(MyContext);
  return (
    <div className="bg-(--primary)  min-h-screen flex flex-row  ">
      <AsideMenu />
      <div className="flex flex-col max-w-4xl mx-auto">
        <img src={darkMode ? logoDM : logoLM} alt="logo" />
        <div className="container mx-auto max-w-4xl flex flex-col  text-center">
          <h1 className="text-4xl font-bold mt-10 mb-8">About Us</h1>
          <div className="flex self-center max-w-3xl">
            <p className="text-lg mb-30 mx-3">
              We are a team of 4 passionate web developers who created this
              social media platform specifically for developers. It's a place
              where developers can share their code, experiences, and connect
              with others in the community!
            </p>
          </div>
          <h2 className="text-3xl font-semibold mb-4">Meet The Team</h2>

          <div className="divide-y divide-(--quaternary) pr-3">
            {/* Team Member 1 */}
            <div className="flex flex-col">
              <div className="flex flex-row py-6">
                <img
                  src={Viktor}
                  alt="Viktor"
                  className="w-32 h-32 object-cover rounded-full mx-20 mb-4"
                />

                <div className=" text-left">
                  <h3 className="text-xl font-semibold ">Viktor</h3>
                  <p className="text-(--textGrey)">
                    Team Leader & Backend Developer
                  </p>
                </div>
              </div>
              <p className="text-(--textGrey) mt-2 mb-5 mx-3">
                Viktor is the backbone of our platform, managing the backend
                systems and ensuring everything runs smoothly.
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="flex flex-col">
              <div className="flex flex-row self-end py-6">
                <div className=" text-right">
                  <h3 className="text-xl font-semibold ">Nikolas</h3>
                  <p className="text-(--textGrey)">Backend Developer</p>
                </div>

                <img
                  src={Nikolas}
                  alt="Nikolas"
                  className="w-32 h-32 object-cover rounded-full mx-20 mb-4"
                />
              </div>
              <p className="text-(--textGrey) mt-2 mb-5 mx-3">
                Nikolas is an expert in backend development and works closely
                with Viktor to ensure the platform's scalability and
                performance.
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="flex flex-col">
              <div className="flex flex-row py-6">
                <img
                  src={Quentin}
                  alt="Quentin"
                  className=" h-32 w-32 object-cover rounded-full mx-20 mb-4"
                />

                <div className="max-w-2xl text-left">
                  <h3 className="text-xl font-semibold ">Quentin</h3>
                  <p className="text-(--textGrey)">
                    Frontend Developer & Motion Designer
                  </p>
                </div>
              </div>
              <p className="text-(--textGrey) mt-2 mb-5 mx-3">
                Quentin is the creative force behind the frontend, adding smooth
                animations, motion design, and ensuring a fantastic user
                experience.
              </p>
            </div>

            {/* Team Member 4 */}
            <div className="flex flex-col">
              <div className="flex flex-row self-end py-6">
                <div className="text-right">
                  <h3 className="text-xl font-semibold ">Nausica</h3>
                  <p className="text-(--textGrey)">Frontend Developer</p>
                </div>

                <img
                  src={Nausica}
                  alt="Nausica"
                  className="w-32 h-32 object-cover rounded-full mx-20 mb-4"
                />
              </div>
              <p className="text-(--textGrey) mt-2 mb-5 mx-3">
                Nausica works alongside Quentin to build a responsive, modern
                interface, creating an intuitive platform for our users.
              </p>
            </div>
          </div>

          <div className="flex flex-col mt-12">
            <h2 className="text-2xl font-semibold mt-40">Our Mission</h2>
            <div className="flex self-center max-w-3xl">
              <p className="text-lg text-(--textGrey) mt-4 mb-40">
                Our mission is to build a platform where developers can share
                code, tips, and personal experiences. We believe in the power of
                collaboration and learning from each other, and we hope to
                create a community where knowledge flows freely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
