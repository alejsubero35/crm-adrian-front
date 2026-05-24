export const actionButtonClasses = {
  edit:
    "h-9 w-9 rounded-full border-2 border-[#1d4ed8] text-[#1d4ed8] bg-white hover:bg-[#e6efff] hover:text-[#1d4ed8] shadow-sm transition-colors duration-200",
  delete:
    "h-9 w-9 rounded-full border-2 border-[#e05a37] text-[#e05a37] bg-white hover:bg-[#fff1eb] hover:text-[#e05a37] shadow-sm transition-colors duration-200",
  ctaOrange:
    "h-11 px-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#000BC2] to-[#3339E0] text-white shadow-lg border border-transparent font-semibold transition-all duration-400 ease-in-out hover:[background-image:none] hover:bg-[#eef0ff] hover:text-[#000BC2] hover:border-[#000BC2] hover:shadow-md hover:-translate-y-0.5",
};

export type ActionButtonVariant = keyof typeof actionButtonClasses;

export function actionButtonClass(variant: ActionButtonVariant): string {
  return actionButtonClasses[variant];
}