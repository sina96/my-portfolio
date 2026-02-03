'use client'
{/* WIP */}

import React, { useEffect, useMemo, useState } from "react";
import LovesMeFlower from "@/components/LoveMeNotFlower";
import catAskingImage from "@/assets/images/anita/cat-asking.jpg";
import happyCatImage from "@/assets/images/anita/happy-cat.jpg";
import rizzCatImage from "@/assets/images/anita/rizz-cat.jpg";
import loveLetterCatsImage from "@/assets/images/anita/kissing-booth.jpg";
import lastPageImage from "@/assets/images/anita/us-2024.jpg";
import noReactionCatImage from "@/assets/images/anita/da-helly.jpg";
import yesReactionCatImage from "@/assets/images/anita/cowboy-cat.jpg";


type CardStep = "question" | "choice-reveal" | "response" | "love-letter" | "last";
type FirstChoice = "yes" | "no";

const CHOICE_REVEAL_MS = 800;

// Step 1: initial Yes/No question
const QUESTION = {
  title: "Can i bother you a minute babygirl?",
  text: "Are you free on february 14th by any chance?",
  imagePlaceholder: catAskingImage.src,
};

// Step 2: 300ms image-only reveal after Yes/No, then full response card
const CHOICE_REVEAL_IMAGE: Record<FirstChoice, string> = {
  yes: yesReactionCatImage.src,
  no: noReactionCatImage.src,
};

const RESPONSE_CONTENT: Record<FirstChoice, { title: string; body: string; imagePlaceholder: string }> = {
  yes: {
    title: "Oh i thought you'd say no",
    body: "I was going to convince you with a love letter, but you're already on board. Do you want to read it anyway?",
    imagePlaceholder: happyCatImage.src,
  },
  no: {
    title: "No",
    body: "Dont't break my heart baby. What if I write you a love letter? Pretty plzzzz",
    imagePlaceholder: rizzCatImage.src,
  },
};

// Step 3: love letter (same for both paths; follow-up button depends on firstChoice)
const LOVE_LETTER = {
  text: `Dear Anita,
i ask you to be my valentine for another year and another year i wait for you to accept it just the way you have granted me your love. You use to ask me ”When did you fall in love with me? How did you know” and wait for me to give you the drug that you need, but in the reality loving you came so easy, so naturally. Suddenly everything became brighter, laughters more genuine and days worth waiting for. It has been a while now that we kissed each other but i am counting minutes to be able to feel your soft lips again and feel comfortably at home in your arms again. Times can be hard but still i do anything to spend every bit of my lifetime with you.

Your silly boy,
Sina`,
  imagePlaceholder: loveLetterCatsImage.src,
  yesFollowUpLabel: "I love you!!!",
  noFollowUpLabel: "Ok, i'll be your valentine",
};

// Step 4: last page
const LAST_PAGE = {
  text: "Can't wait to spend my valentine with the most beautiful girl in the world. Until then, enjoy this playlist for our valentine:",
  imagePlaceholder: lastPageImage.src,
  spotifyPlaylistUri:
    "spotify:playlist:6U58wcw46QMJE3kJjaAlgM?si=26c187b1af6c4805&pt=5c0944927148a98b0e03076e8d90c88e",
};

const btnBase =
  "rounded-xl border-2 border-[#281616] px-5 py-2.5 text-lg font-semibold transition-all";

function CardShell({
  children,
  imageSrc,
  imageAlt = "",
  fullSizeImage = false,
}: {
  children: React.ReactNode;
  imageSrc: string;
  imageAlt?: string;
  fullSizeImage?: boolean;
}) {
  return (
    <div className="w-full rounded-2xl border-2 border-[#281616]/20 bg-white/90 shadow-lg overflow-hidden">
      <div
        className={`w-full bg-[#F0C4C4]/30 relative flex justify-center ${fullSizeImage ? "" : "aspect-[5/3]"}`}
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          className={`${fullSizeImage ? "w-[60%] h-auto object-contain" : "w-full h-full object-cover"}`}
        />
      </div>
      <div className="p-5 sm:p-6 space-y-4">{children}</div>
    </div>
  );
}

export default function Page() {
  const initialPetalCount = 8;

  const initialPetals = useMemo(
    () => Array.from({ length: initialPetalCount }, (_, i) => i),
    [initialPetalCount]
  );

  const [petals, setPetals] = useState<number[]>(initialPetals);
  const [love, setLove] = useState(false);
  const [cardStep, setCardStep] = useState<CardStep>("question");
  const [firstChoice, setFirstChoice] = useState<FirstChoice | null>(null);

  const onPetalClick = (id: number) => {
    setPetals((prev) => {
      const next = prev.filter((p) => p !== id);
      setLove(next.length % 2 === 0);
      return next;
    });
  };

  const onReset = () => {
    setPetals(initialPetals);
    setLove(false);
  };

  const handleQuestionChoice = (choice: FirstChoice) => {
    setFirstChoice(choice);
    setCardStep("choice-reveal");
  };

  // After choice-reveal, auto-advance to response after 300ms
  useEffect(() => {
    if (cardStep !== "choice-reveal") return;
    const t = setTimeout(() => setCardStep("response"), CHOICE_REVEAL_MS);
    return () => clearTimeout(t);
  }, [cardStep]);

  const handleSureWhyNot = () => {
    setCardStep("love-letter");
  };

  const handleFollowUp = () => {
    setCardStep("last");
    // TODO: trigger background effect when reaching last page
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F0C4C4] p-4">
      {petals.length === 0 ? (
        <section
          className="w-full max-w-lg [font-family:'Patrick_Hand_SC',cursive] text-[#281616] flex flex-col items-center"
          aria-label="Card section"
        >
          {/* Step 1: Yes/No question */}
          {cardStep === "question" && (
            <CardShell imageSrc={QUESTION.imagePlaceholder}>
              <h2 className="text-2xl sm:text-3xl font-bold text-center">
                {QUESTION.title}
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-center justify-center">
                {QUESTION.text}
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => handleQuestionChoice("yes")}
                  className={`${btnBase} bg-white text-[#281616] hover:bg-[#281616]/10`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleQuestionChoice("no")}
                  className={`${btnBase} bg-white text-[#281616] hover:bg-[#281616]/10`}
                >
                  No
                </button>
              </div>
            </CardShell>
          )}

          {/* Step 2a: Image-only reveal for 300ms after Yes/No */}
          {cardStep === "choice-reveal" && firstChoice !== null && (
            <div className="w-full rounded-2xl border-2 border-[#281616]/20 bg-white/90 shadow-lg overflow-hidden">
              <div className="aspect-[5/3] w-full bg-[#F0C4C4]/30 relative">
                <img
                  src={CHOICE_REVEAL_IMAGE[firstChoice]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Step 2b: Yes or No response + "Sure why not" */}
          {cardStep === "response" && firstChoice !== null && (
            <CardShell
              imageSrc={RESPONSE_CONTENT[firstChoice].imagePlaceholder}
              imageAlt={RESPONSE_CONTENT[firstChoice].title}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-center">
                {RESPONSE_CONTENT[firstChoice].title}
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-center justify-center">
                {RESPONSE_CONTENT[firstChoice].body}
              </p>
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleSureWhyNot}
                  className={`${btnBase} bg-[#281616] text-white hover:opacity-90`}
                >
                  Sure why not
                </button>
              </div>
            </CardShell>
          )}

          {/* Step 3: Love letter + Yes/No follow-up button */}
          {cardStep === "love-letter" && firstChoice !== null && (
            <CardShell
              imageSrc={LOVE_LETTER.imagePlaceholder}
              imageAlt="Love letter"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-center">
              💌💌💌
              </h2>
              <div
                className="text-base sm:text-lg text-left leading-loose whitespace-pre-line sm:max-w-[85%] mx-auto"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {LOVE_LETTER.text}
              </div>
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleFollowUp}
                  className={`${btnBase} bg-[#281616] text-white hover:opacity-90`}
                >
                  {firstChoice === "yes"
                    ? LOVE_LETTER.yesFollowUpLabel
                    : LOVE_LETTER.noFollowUpLabel}
                </button>
              </div>
            </CardShell>
          )}

          {/* Step 4: Last page + barcode placeholder */}
          {cardStep === "last" && (
            <CardShell imageSrc={LAST_PAGE.imagePlaceholder} imageAlt="Last page" fullSizeImage>
              <h2 className="text-2xl sm:text-3xl font-bold text-center">
              💖 See you soon 💖
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-center justify-center">
                {LAST_PAGE.text}
              </p>
              <div className="flex justify-center pt-4">
                <a
                  href={LAST_PAGE.spotifyPlaylistUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btnBase} inline-flex bg-[#1DB954] border-[#1DB954] text-white hover:opacity-90`}
                >
                  Open playlist in Spotify
                </a>
              </div>
            </CardShell>
          )}
        </section>
      ) : (
        <LovesMeFlower
          petals={petals}
          love={love}
          onPetalClick={onPetalClick}
          onReset={onReset}
          initialPetalCount={initialPetalCount}
        />
      )}
    </div>
  );
}
