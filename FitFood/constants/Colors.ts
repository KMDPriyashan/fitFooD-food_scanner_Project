// FitFood App Color Palette

export const colors = {
  // Primary Colors
  primary: '#E53935',      // Tomato Red
  primaryDark: '#C62828',
  primaryLight: '#FFCDD2',
  
  // Secondary Colors
  secondary: '#43A047',    // Fresh Green
  secondaryDark: '#2E7D32',
  secondaryLight: '#A5D6A7',
  
  // Neutrals
  white: '#FFFFFF',
  cream: '#FFF8E1',
  black: '#000000',
  gray: '#9E9E9E',
  grayLight: '#F5F5F5',
  grayDark: '#424242',
  
  // Status Colors
  success: '#43A047',
  warning: '#FFB300',
  danger: '#E53935',
  info: '#2196F3',
  
  // Text Colors
  text: '#333333',
  textLight: '#666666',
  textWhite: '#FFFFFF',
  
  // Backgrounds
  background: '#F5F5F5',
  card: '#FFFFFF',
  border: '#E0E0E0',
  shadow: 'rgba(0,0,0,0.1)',
};

// ✅ ADD THIS FUNCTION - Export කරන්න
export const getHealthScoreColor = (score: number): string => {
  if (score >= 80) return colors.success;
  if (score >= 60) return colors.warning;
  if (score >= 40) return colors.primary;
  if (score >= 20) return colors.danger;
  return colors.grayDark;
};

// ✅ ADD THIS FUNCTION - Export කරන්න
export const getHealthScoreLabel = (score: number): string => {
  if (score >= 80) return 'Excellent! 🎉';
  if (score >= 60) return 'Good! 👍';
  if (score >= 40) return 'Average 😐';
  if (score >= 20) return 'Poor 😕';
  return 'Bad 😢';
};

export default colors;