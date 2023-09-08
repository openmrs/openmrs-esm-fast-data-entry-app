declare module "@carbon/react";
declare module "*.css";
declare module "*.scss" {
  const content: { [className: string]: string };
  export = content;
}

declare type SideNavProps = object;
