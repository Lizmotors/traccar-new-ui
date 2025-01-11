
export default {
  MuiCssBaseline: {
    styleOverrides: {
      'html, body': {
        margin: 0,
        padding: 0,
        overflowX: 'hidden',
        width: '100%',
        height: '100%',
      },
      body: {
        background: 'var(--background-gradient)',
        minHeight: '100vh',
      },
      '#root': {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowX: 'hidden',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        backgroundColor: 'var(--background-paper)',
        borderRadius: 16,
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 600,
      },
      contained: {
        background: 'var(--primary-gradient)',
        '&:hover': {
          background: 'var(--primary-gradient)',
          filter: 'brightness(110%)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.12)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
        },
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      root: {
        '& .MuiDrawer-paper': {
          overflow: 'hidden',
          '&:hover': {
            overflowY: 'auto',
          },
        },
      },
      paper: {
        border: 'none',
        background: 'var(--background-paper)',
      },
    },
  },
  MuiFormControl: {
    defaultProps: {
      size: "small",
    },
  },
  MuiUseMediaQuery: {
    defaultProps: {
      noSsr: true,
    },
  },
  MuiSnackbar: {
    defaultProps: {
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "center",
      },
    },
  },
};
