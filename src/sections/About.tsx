"use client";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import BookImage from "@/assets/images/hobbitt.jpg";
import Image from "next/image";
import SpringIcon from "@/assets/icons/spring-boot.svg";
import SQLIcon from "@/assets/icons/sql-db.svg";
import VSCodeIcon from "@/assets/icons/vscode3.svg";
import IntelliJIcon from "@/assets/icons/intellijidea-svg.svg";
import JavaScriptIcon from "@/assets/icons/square-js.svg";
import HtmlIcon from "@/assets/icons/html5.svg";
import CSSIcon from "@/assets/icons/css3.svg";
import ReactIcon from "@/assets/icons/react.svg";
import GithubIcon from "@/assets/icons/github.svg";
import ChromeIcon from "@/assets/icons/chrome.svg";
import mapImage from "@/assets/images/sina-map.jpg";
import smileMemoji from "@/assets/images/sina-smile-memoji.png";
import { CardHeader } from "@/components/CardHeader";
import { ToolBoxItems } from "@/components/ToolBoxItems";
import { motion } from "framer-motion";
import { useRef } from "react";

const toolboxItems = [
  {
    title: "IntelliJ",
    iconType: IntelliJIcon,
  },
  {
    title: "Spring",
    iconType: SpringIcon,
  },
  {
    title: "VSCode",
    iconType: VSCodeIcon,
  },
  {
    title: "JavaScript",
    iconType: JavaScriptIcon,
  },
  {
    title: "HTML5",
    iconType: HtmlIcon,
  },
  {
    title: "CSS3",
    iconType: CSSIcon,
  },
  {
    title: "React",
    iconType: ReactIcon,
  },
  {
    title: "SQL",
    iconType: SQLIcon,
  },
  {
    title: "Chrome",
    iconType: ChromeIcon,
  },
  {
    title: "Github",
    iconType: GithubIcon,
  },
];

const hobbies = [
  {
    title: "painting",
    emoji: "🎨",
    left: "5%",
    top: "5%",
  },
  {
    title: "photography",
    emoji: "📷",
    left: "50%",
    top: "5%",
  },
  {
    title: "music",
    emoji: "🎧",
    left: "70%",
    top: "45%",
  },
  {
    title: "fitness",
    emoji: "🏋️",
    left: "5%",
    top: "65%",
  },

  {
    title: "reading",
    emoji: "📚",
    left: "45%",
    top: "70%",
  },
  {
    title: "cooking",
    emoji: "👨‍🍳",
    left: "35%",
    top: "40%",
  },
  {
    title: "gaming",
    emoji: "🎮",
    left: "10%",
    top: "35%",
  },
];

export const AboutSection = () => {
  const constraintRef = useRef(null);
  return (
    <div id="about" className="py-16 lg:py-28">
      <div className="container">
        <SectionHeader
          eyebrow="About me"
          title="A Glimpse into my world"
          description="Learn more about who I am, what i do and what inspires me."
        />
        <div className="mt-20 flex flex-col gap-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-5 lg:grid-cols-3">
            <Card className="h-[320px] md:col-span-2 lg:col-span-1">
              <CardHeader
                title="Next in todo list"
                description="I really need to read the lord of the rings saga!"
              />
              <div className="w-40 mx-auto mt-2 md:mt-0">
                <Image src={BookImage} alt="book cover" />
              </div>
            </Card>
            <Card className="h-[320px] md:col-span-3 lg:col-span-2">
              <CardHeader
                title="My Toolbox"
                description="Explore the tech and tools I use everyday"
                className=""
              />
              <ToolBoxItems
                items={toolboxItems}
                className=""
                itemsWrapperClassName="animate-move-left [animation-duration:60s]"
              />
              <ToolBoxItems
                items={toolboxItems}
                className="mt-6 "
                itemsWrapperClassName="animate-move-right [animation-duration:40s]"
              />
            </Card>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-5 lg:grid-cols-3">
            <Card className="h-[320px] p-0 flex flex-col md:col-span-3 lg:col-span-2">
              <CardHeader
                title="Beyond the code"
                description="Explore my interests and hobbies beyond the digital realm."
                className="px-6 py-6"
              />
              <div className="relative flex-1" ref={constraintRef}>
                {hobbies.map((hobby) => (
                  <motion.div
                    key={hobby.title}
                    className="inline-flex items-center gap-2 px-6 bg-gradient-to-r from-emerald-300 to-sky-400 rounded-full py-1.5 absolute"
                    style={{
                      left: hobby.left,
                      top: hobby.top,
                    }}
                    drag
                    dragConstraints={constraintRef}
                  >
                    <span className="font-medium text-gray-950">
                      {hobby.title}
                    </span>
                    <span>{hobby.emoji}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
            <Card className="h-[320px] p-0 relative md:col-span-2 lg:col-span-1">
              <Image
                src={mapImage}
                alt="map"
                className="h-full w-full object-cover object-left-top"
              />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-20 rounded-full 
             after:content-[''] after:absolute after:inset-0 after:outline after:outline-2 after:-outline-offset-2 after:rounded-full after:outline-gray-950/30"
              >
                <div className="absolute inset-0 rounded-full -z-20 bg-gradient-to-r from-emerald-300 to-sky-400 animate-ping [animation-duration:2s]"></div>

                <div className="absolute inset-0 rounded-full -z-10 bg-gradient-to-r from-emerald-300 to-sky-400"></div>
                <Image
                  src={smileMemoji}
                  alt="smileMemoji"
                  className="size-20"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
