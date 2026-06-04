export const theme = {
    colors: {
        primary: '#0D0D0D', // Jet black for text, main buttons
        accent: '#F5C518',  // Yellow for alerts, icons, badges
        background: '#FAFAFA', // Light background
        surface: '#FFFFFF', // Card/dropdown background
        border: '#E5E5E5',
        text: {
            main: '#0D0D0D',
            muted: '#737373',
            light: '#A3A3A3'
        },
        notification: {
            unreadBg: '#FFFBEB',
            readBg: '#FFFFFF',
            unreadDot: '#F5C518'
        }
    },
    typography: {
        fontFamily: '"Inter", sans-serif',
        fontSize: {
            xs: '11px',
            sm: '12px',
            md: '13.5px',
            lg: '16px'
        },
        fontWeight: {
            normal: 400,
            semibold: 600,
            bold: 700,
            black: 900
        }
    },
    shadows: {
        dropdown: '4px 4px 0px #0D0D0D',
        card: '2px 2px 0px #F5C518'
    },
    borderRadius: {
        md: '8px',
        lg: '12px',
        xl: '16px'
    }
};

export default theme;
