import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      primaryHover: string;
      secondary: string;
      secondaryHover: string;
      background: string;
      backgroundDark: string;
      backgroundDarker: string;
      text: string;
      textLight: string;
      textDark: string;
      border: string;
      borderDark: string;
      error: string;
      success: string;
      warning: string;
      info: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    breakpoints: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    fonts: {
      body: string;
      heading: string;
      mono: string;
    };
    fontSizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
    };
    space: {
      px: string;
      0: string;
      0.5: string;
      1: string;
      1.5: string;
      2: string;
      2.5: string;
      3: string;
      3.5: string;
      4: string;
      5: string;
      6: string;
      7: string;
      8: string;
      9: string;
      10: string;
      12: string;
      14: string;
      16: string;
      20: string;
      24: string;
      28: string;
      32: string;
      36: string;
      40: string;
      44: string;
      48: string;
      52: string;
      56: string;
      60: string;
      64: string;
      72: string;
      80: string;
      96: string;
    };
    radii: {
      none: string;
      sm: string;
      base: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      full: string;
    };
    transitions: {
      default: string;
      fast: string;
      slow: string;
    };
  }
}
