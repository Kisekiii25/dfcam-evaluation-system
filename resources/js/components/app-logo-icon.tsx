import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <div className="flex-shrink-0 overflow-hidden rounded-full border-2 border-gray-200 bg-white w-25 h-25 flex items-center justify-center mb-15">
            <img
                {...props}
                src="/DFCAM-logo.webp"
                alt="DFCAMCLP Logo"
                className=" object-contain"
            />
        </div>
    );
}
