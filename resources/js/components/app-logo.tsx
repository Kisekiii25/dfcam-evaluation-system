import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-full border-[1.5px] border-black bg-white dark:border-white bg-black shadow-sm overflow-hidden flex-shrink-0">
                <img
                    src="/DFCAM-logo.webp"
                    alt="DFCAMCLP Logo"
                    className="h-full w-full object-cover"
                />
            </div>
            
            <div className="ml-2 grid flex-1 text-left">
                {/* The acronym is prominent, leading-none keeps it tight */}
                <h1 className="leading-none font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                    DFCAMCLP
                </h1>
                {/* The description is smaller, lighter color, and has tighter leading */}
                <span className="mt-0.5 text-xs leading-tight font-medium text-zinc-500 dark:text-zinc-400">
                    Evaluation System
                </span>
            </div>
        </>
    );
}
