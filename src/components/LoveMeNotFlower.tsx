
'use client'
{/* WIP */}

import React, { memo, useId } from "react";

type Props = {
  petals: number[];
  love: boolean;
  onPetalClick: (id: number) => void;
  onReset: () => void;

  // Optional
  title?: string;
  showCount?: boolean;
};

function FlowerDefs({ idPrefix }: { idPrefix: string }) {
  const stem = `${idPrefix}-stem`;
  const stemFilter = `${idPrefix}-stemFilter`;
  const petal = `${idPrefix}-petal`;
  const petalFilter = `${idPrefix}-petalFilter`;
  const sm = `${idPrefix}-sm`;
  const smFilter = `${idPrefix}-smFilter`;
  const lg = `${idPrefix}-lg`;
  const lgFilter = `${idPrefix}-lgFilter`;

  return (
    <defs>
      <path
        d="M130.987847,122 C133.659505,157.293805 135.315501,187.391727 135.955835,212.293767 C136.596169,237.195806 130.273506,263.431217 116.987847,291"
        id={stem}
      />
      <filter
        x="-63.1%"
        y="-5.9%"
        width="226.2%"
        height="114.2%"
        filterUnits="objectBoundingBox"
        id={stemFilter}
      >
        <feMorphology radius="5" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1" />
        <feOffset dx="0" dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1" />
        <feMorphology radius="5" operator="erode" in="SourceAlpha" result="shadowInner" />
        <feOffset dx="0" dy="2" in="shadowInner" result="shadowInner" />
        <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1" />
        <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1" />
        <feColorMatrix
          values="0 0 0 0 0.819607843   0 0 0 0 0.764705882   0 0 0 0 0.764705882  0 0 0 0.5 0"
          type="matrix"
          in="shadowBlurOuter1"
        />
      </filter>

      <path
        d="M223.120444,246.724259 C216.601694,240.205509 198.89935,211.936759 205.4181,205.418009 C211.93685,198.899259 240.2056,216.603165 246.72435,223.120353 C253.2431,229.639103 253.2431,240.205509 246.72435,246.724259 C240.2056,253.241446 229.638412,253.241446 223.120444,246.724259 Z"
        id={petal}
      />
      <filter
        x="-18.9%"
        y="-18.9%"
        width="137.8%"
        height="137.8%"
        filterUnits="objectBoundingBox"
        id={petalFilter}
      >
        <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1" />
        <feGaussianBlur stdDeviation="3" in="shadowOffsetOuter1" result="shadowBlurOuter1" />
        <feColorMatrix
          values="0 0 0 0 0.482352941   0 0 0 0 0.384313725   0 0 0 0 0.384313725  0 0 0 0.5 0"
          type="matrix"
          in="shadowBlurOuter1"
        />
      </filter>

      <circle id={sm} cx="27" cy="27" r="27" />
      <filter
        x="-16.7%"
        y="-16.7%"
        width="133.3%"
        height="133.3%"
        filterUnits="objectBoundingBox"
        id={smFilter}
      >
        <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1" />
        <feGaussianBlur stdDeviation="3" in="shadowOffsetOuter1" result="shadowBlurOuter1" />
        <feColorMatrix
          values="0 0 0 0 0.819169855   0 0 0 0 0.758145838   0 0 0 0 0.758145838  0 0 0 0.5 0"
          type="matrix"
          in="shadowBlurOuter1"
        />
      </filter>

      <circle id={lg} cx="27" cy="27" r="18" />
      <filter
        x="-25.0%"
        y="-25.0%"
        width="150.0%"
        height="150.0%"
        filterUnits="objectBoundingBox"
        id={lgFilter}
      >
        <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1" />
        <feGaussianBlur stdDeviation="3" in="shadowOffsetOuter1" result="shadowBlurOuter1" />
        <feColorMatrix
          values="0 0 0 0 0.819169855   0 0 0 0 0.758145838   0 0 0 0 0.758145838  0 0 0 0.5 0"
          type="matrix"
          in="shadowBlurOuter1"
        />
      </filter>
    </defs>
  );
}

function LovesMeFlower({
  petals,
  love,
  onPetalClick,
  onReset,
  title,
  showCount = true,
}: Props) {
  const uid = useId().replace(/:/g, "");

  const heading =
    title ?? (petals.length === 0 ? "Loves me!" : love ? "Loves me not..." : "Loves me...");

  const stem = `#${uid}-stem`;
  const stemFilter = `url(#${uid}-stemFilter)`;
  const petal = `#${uid}-petal`;
  const petalFilter = `url(#${uid}-petalFilter)`;
  const sm = `#${uid}-sm`;
  const smFilter = `url(#${uid}-smFilter)`;
  const lg = `#${uid}-lg`;
  const lgFilter = `url(#${uid}-lgFilter)`;

  return (
    <div className="text-center [font-family:'Patrick_Hand_SC',cursive]">
      <div className="text-[48px] text-[#281616]">{heading}</div>

      <div className="inline-flex items-center gap-3 my-3">
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl border border-[#281616] bg-white text-[#281616] px-4 py-2 hover:opacity-85"
        >
          Reset
        </button>

        {showCount && (
          <div className="text-lg text-[#281616]">
            Petals left: <strong>{petals.length}</strong>
          </div>
        )}
      </div>

      <svg
        className="h-[80vh] w-[80vw]"
        width="244"
        height="302"
        viewBox="0 0 244 302"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        role="img"
        aria-label="Flower with removable petals"
      >
        <FlowerDefs idPrefix={uid} />

        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g transform="translate(-78.000000, -78.000000)">
            <g transform="translate(78.000000, 78.000000)">
              <circle fill="#F0C4C4" cx="122" cy="122" r="122" />
              <g
                strokeLinecap="round"
                transform="translate(126.493923, 206.500000) scale(-1, 1) translate(-126.493923, -206.500000)"
              >
                <use fill="black" fillOpacity="1" filter={stemFilter} xlinkHref={stem} />
                <use stroke="#E4E8E4" strokeWidth="10" xlinkHref={stem} />
              </g>
            </g>

            {/* Petals */}
            <g transform="translate(0,0)" fill="#FFFFFF" fillRule="nonzero">
              {petals.map((i) => {
                const rotate =
                  i > 3 ? `rotate(${90 * i + 45} 200 200)` : `rotate(${90 * i} 200 200)`;

                return (
                  <g
                    key={i}
                    transform={rotate}
                    onClick={() => onPetalClick(i)}
                    className="cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") onPetalClick(i);
                    }}
                    aria-label={`Remove petal ${i + 1}`}
                  >
                    <use fill="black" fillOpacity="1" filter={petalFilter} xlinkHref={petal} />
                    <use xlinkHref={petal} className="transition-[fill] duration-200 hover:fill-[#c1a1a1]" />
                  </g>
                );
              })}
            </g>

            {/* Center */}
            <g transform="translate(173.000000, 173.000000)">
              <g>
                <use fill="black" fillOpacity="1" filter={smFilter} xlinkHref={sm} />
                <use fill="#F9E589" fillRule="evenodd" xlinkHref={sm} />
              </g>
              <g>
                <use fill="black" fillOpacity="1" filter={lgFilter} xlinkHref={lg} />
                <use fill="#F6C261" fillRule="evenodd" xlinkHref={lg} />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

export default memo(LovesMeFlower);
