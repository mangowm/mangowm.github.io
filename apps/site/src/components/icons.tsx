import {
  ArrowRight as LucideArrowRight,
  ArrowDown as LucideArrowDown,
  Heart,
  X,
  Check,
  Copy,
  Image,
  Wallet,
  TriangleAlert,
  ChevronDown,
  RectangleHorizontal,
  RectangleVertical,
  type LucideProps,
} from "lucide-react";
import githubLogo from "@mangowm/assets/logos/github.svg";
import githubWhiteLogo from "@mangowm/assets/logos/github-white.svg";
import discordLogo from "@mangowm/assets/logos/discord.svg";
import discordWhiteLogo from "@mangowm/assets/logos/discord-white.svg";

export function GithubIcon() {
  return (
    <span className="inline-flex items-center">
      <img src={githubLogo} alt="" aria-hidden="true" className="github-light w-5 h-5" />
      <img src={githubWhiteLogo} alt="" aria-hidden="true" className="github-dark w-5 h-5" />
    </span>
  );
}

export function DiscordIcon() {
  return (
    <span className="inline-flex items-center">
      <img src={discordLogo} alt="" aria-hidden="true" className="discord-light w-5 h-5" />
      <img src={discordWhiteLogo} alt="" aria-hidden="true" className="discord-dark w-5 h-5" />
    </span>
  );
}

export const ArrowRight = () => <LucideArrowRight size={12} strokeWidth={2.5} />;

export const ArrowDown = () => <LucideArrowDown size={16} />;

export const HeartSvg = (props: LucideProps) => <Heart {...props} />;

export const XSvg = (props: LucideProps) => <X {...props} />;

export const CheckSvg = (props: LucideProps) => <Check {...props} />;

export const CopySvg = (props: LucideProps) => <Copy {...props} />;

export const ImageSvg = (props: LucideProps) => <Image {...props} />;

export const WalletSvg = (props: LucideProps) => <Wallet {...props} />;

export const AlertTriangleSvg = (props: LucideProps) => <TriangleAlert {...props} />;

export const ChevronDownIcon = () => <ChevronDown size={12} />;

export const HorizIcon = () => <RectangleHorizontal size={14} />;

export const VertIcon = () => <RectangleVertical size={14} />;
