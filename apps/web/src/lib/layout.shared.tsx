import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";
import { basePath } from "./base-path";

const logo = (
	<Image
		alt="MangoWC"
		src={`${basePath}/logo-32x32.webp`}
		width={32}
		height={32}
		className="size-5"
	/>
);

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: (
				<>
					{logo}
					<span className="font-medium max-md:hidden">MangoWC</span>
				</>
			),
		},
	};
}
