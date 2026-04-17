declare namespace JSX {
  interface IntrinsicElements {
    'amp-carousel': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        width?: string;
        height?: string;
        layout?: string;
        type?: string;
        autoplay?: boolean | string;
        delay?: string;
      },
      HTMLElement
    >;
  }
}
