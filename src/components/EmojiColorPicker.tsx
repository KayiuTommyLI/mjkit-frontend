import React, { useState } from 'react';
import { 
  Box, 
  Popover, 
  Grid,
  Typography,
  IconButton,
  Paper,
  Tabs,
  Tab,
  Divider,
  Slider
} from '@mui/material';
import { t } from 'i18next';

interface EmojiColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  emoji?: string;
  onEmojiChange?: (emoji: string) => void;
  label?: string;
  colors?: Array<{name: string, value: string}>;
  noBorder?: boolean;
}

// Categorized emojis for organized selection
const emojiCategories = [
  {
    name: t("fantasyMagic"),
    emojis: [
      '🧙', '🧙‍♀️', '🧙‍♂️', '🧚', '🧚‍♀️', '🧚‍♂️', '🧛', '🧛‍♀️', '🧛‍♂️', '🧜',
      '🧜‍♀️', '🧜‍♂️', '🧝', '🧝‍♀️', '🧝‍♂️', '🧞', '🧞‍♀️', '🧞‍♂️', '🧟', '🧟‍♀️',
      '🧟‍♂️', '👻', '👽', '👾', '🤖', '💀', '☠️', '👹', '👺', '🤡',
      '💩', '👿', '😈', '🤠', '🤡', '👻', '💀', '☠️', '👽', '🛸'
    ]
  },
  {
    name: t("animals"),
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
      '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐔', '🐧',
      '🐦', '🐤', '🐣', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴',
      '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷',
      '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀'
    ]
  },
  {
    name: t("facesPeople"),
    emojis: [
      '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', 
      '😋', '😎', '😍', '🥰', '😘', '😗', '😙', '😚', '🙂', '🤔',
      '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐',
      '😯', '😪', '😫', '🥱', '😴', '😌', '😛', '😜', '😝', '🤤',
      '👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👴', '👵', '🧓'
    ]
  },
  {
    name: t("gameFun"),
    emojis: [
      '🎮', '🎲', '🎯', '🎪', '🎭', '🎨', '🎰', '🎱', '🎳', '♟️',
      '🎴', '🀄', '🎪', '🎫', '🎟️', '🧩', '🧸', '🖼️', '🎨', '🎭',
      '🎪', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸',
      '🪘', '🎻', '🎲', '🎯', '🎳', '🎮', '🎰', '🧩', '🎪', '🎭'
    ]
  },
  {
    name: t("objectsSymbols"),
    emojis: [
      '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎪', '🎫',
      '💎', '💍', '💄', '👑', '👒', '🎩', '🧢', '⛑️', '📿', '💄',
      '🔮', '📱', '💻', '⌨️', '🖥️', '📷', '🎥', '🔋', '💡', '🔦',
      '🧯', '🛒', '🧨', '💣', '⚔️', '🛡️', '🔧', '🔩', '⚙️', '🧲'
    ]
  },
  {
    name: t("natureWeather"),
    emojis: [
      '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑',
      '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '💫', '⭐', '🌟',
      '✨', '⚡', '☄️', '💥', '🔥', '🌪', '🌈', '☀️', '🌤️', '⛅',
      '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️'
    ]
  },
  {
    name: t("foodPlants"),
    emojis: [
      '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈',
      '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
      '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁',
      '🍂', '🍃', '🍄', '🌰', '🦀', '🦞', '🦐', '🦑', '🦪', '🍖'
    ]
  }
];

// Flatten the categories for the current UI, but we'll use the categories later
const availableEmojis = emojiCategories.flatMap(category => category.emojis);

// Reuse isLightColor function
function isLightColor(color: string): boolean {
  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate perceived brightness using YIQ formula
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // YIQ < 128 is considered a dark color
  return yiq >= 128;
}

// Convert RGB values to a hex color string
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Convert hex color string to RGB values
function hexToRgb(hex: string): {r: number, g: number, b: number} {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h.split('').map(c => c + c).join('');
  }
  
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16)
  };
}

export const EmojiColorPicker: React.FC<EmojiColorPickerProps> = ({
  value,
  onChange,
  emoji = '🖌️',
  onEmojiChange,
  label,
  colors = [],
  noBorder
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [tabValue, setTabValue] = useState(0); // 0 for colors, 1 for emojis
  const [currentEmoji, setCurrentEmoji] = useState(emoji);
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  
  // RGB state for custom color picker
  const { r: initialR, g: initialG, b: initialB } = hexToRgb(value);
  const [rgb, setRgb] = useState({ r: initialR, g: initialG, b: initialB });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
    // Reset RGB values to current color when opening
    const { r, g, b } = hexToRgb(value);
    setRgb({ r, g, b });
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowCustomColorPicker(false);
  };

  const handleColorSelect = (color: string) => {
    onChange(color);
  };

  const handleEmojiSelect = (newEmoji: string) => {
    setCurrentEmoji(newEmoji);
    if (onEmojiChange) {
      onEmojiChange(newEmoji);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setShowCustomColorPicker(false);
  };

  const handleRgbChange = (component: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgb, [component]: value };
    setRgb(newRgb);
    onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const toggleCustomColorPicker = () => {
    setShowCustomColorPicker(prev => !prev);
  };

  // Color map presets - common colors for the color map
  const colorMap = [
    // Reds
    '#FF0000', '#FF3333', '#FF6666', '#FF9999', '#FFCCCC',
    // Oranges
    '#FF8000', '#FF9933', '#FFB366', '#FFCC99', '#FFE6CC',
    // Yellows
    '#FFFF00', '#FFFF33', '#FFFF66', '#FFFF99', '#FFFFCC',
    // Greens
    '#00FF00', '#33FF33', '#66FF66', '#99FF99', '#CCFFCC',
    // Cyans
    '#00FFFF', '#33FFFF', '#66FFFF', '#99FFFF', '#CCFFFF',
    // Blues
    '#0000FF', '#3333FF', '#6666FF', '#9999FF', '#CCCCFF',
    // Purples
    '#8000FF', '#9933FF', '#B366FF', '#CC99FF', '#E6CCFF',
    // Magentas
    '#FF00FF', '#FF33FF', '#FF66FF', '#FF99FF', '#FFCCFF',
    // Grays
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  ];

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: '80px'
    }}>
      {/* Label */}
      {label && (
        <Typography 
          variant="caption" 
          color="silver" 
          sx={{ mb: 0.5, ml: 1 }}
        >
          {label}
        </Typography>
      )}

      {/* Color Display with Emoji */}
      <Box 
        onClick={handleClick}
        sx={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 0.7,
          border: noBorder ? 'none' : '1px solid silver', // Apply border conditionally
          borderRadius: 1,
          width: '80%',
          height: '28px',
          '&:hover': {
            borderColor: noBorder ? 'transparent' : 'white'
          }
        }}
      >
        {/* Color Circle with Emoji */}
        <Box 
          sx={{ 
            width: 28, 
            height: 28, 
            borderRadius: '50%', 
            backgroundColor: value,
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography 
            sx={{ 
              fontSize: '16px', 
              color: isLightColor(value) ? '#000' : '#fff' 
            }}
          >
            {currentEmoji}
          </Typography>
        </Box>
      </Box>

      {/* Color & Emoji Picker Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Paper 
          sx={{ 
            width: 300,
            maxHeight: 400,
            backgroundColor: 'rgba(36, 36, 36, 0.95)',
            border: '1px solid rgba(192, 192, 192, 0.3)'
          }}
        >
          {/* Tabs for selection mode */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="picker options"
            sx={{
              borderBottom: 1,
              borderColor: 'rgba(192, 192, 192, 0.3)',
              '& .MuiTabs-indicator': {
                backgroundColor: 'white',
              },
              '& .MuiTab-root': {
                color: 'silver',
                '&.Mui-selected': {
                  color: 'white',
                }
              }
            }}
          >
            <Tab label={t('colorsTitle')} />
            <Tab label={t('emojiTitle')} />
          </Tabs>

          {/* Colors Tab Panel */}
          <Box 
            role="tabpanel" 
            hidden={tabValue !== 0} 
            sx={{ 
              p: 2, 
              overflowY: 'auto',
              maxHeight: 340
            }}
          >
            {!showCustomColorPicker ? (
              <>
                {/* Color Map Grid */}
                <Typography variant="subtitle2" color="silver" gutterBottom>
                  {t("colorMapTitle")}
                </Typography>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  {colorMap.map((color) => (
                    <Grid item key={color}>
                      <IconButton 
                        onClick={() => handleColorSelect(color)}
                        sx={{
                          width: 28,
                          height: 28,
                          backgroundColor: color,
                          border: value === color ? '2px solid white' : '1px solid rgba(255,255,255,0.3)',
                          '&:hover': {
                            opacity: 0.9,
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        {value === color && (
                          <Typography 
                            sx={{ 
                              fontSize: '14px', 
                              color: isLightColor(color) ? '#000' : '#fff' 
                            }}
                          >
                            ✓
                          </Typography>
                        )}
                      </IconButton>
                    </Grid>
                  ))}
                </Grid>

                {/* Preset Colors */}
                {colors.length > 0 && (
                  <>
                    <Divider sx={{ my: 1, borderColor: 'rgba(192, 192, 192, 0.3)' }} />
                    <Typography variant="subtitle2" color="silver" gutterBottom>
                      {t("presetColors")}
                    </Typography>
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      {colors.map((colorObj) => (
                        <Grid item key={colorObj.value}>
                          <IconButton 
                            onClick={() => handleColorSelect(colorObj.value)}
                            sx={{
                              width: 28,
                              height: 28,
                              backgroundColor: colorObj.value,
                              border: value === colorObj.value ? '2px solid white' : '1px solid rgba(255,255,255,0.3)',
                              '&:hover': {
                                opacity: 0.9,
                                transform: 'scale(1.05)'
                              }
                            }}
                          >
                            {value === colorObj.value && (
                              <Typography 
                                sx={{ 
                                  fontSize: '14px', 
                                  color: isLightColor(colorObj.value) ? '#000' : '#fff' 
                                }}
                              >
                                ✓
                              </Typography>
                            )}
                          </IconButton>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}

                {/* Custom Color Button */}
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <IconButton 
                    onClick={toggleCustomColorPicker}
                    sx={{
                      border: '1px dashed silver',
                      p: 1,
                      borderRadius: 1,
                      color: 'silver',
                      '&:hover': {
                        color: 'white',
                        borderColor: 'white'
                      }
                    }}
                  >
                    <Typography variant="caption">{t("customColor")}</Typography>
                  </IconButton>
                </Box>
              </>
            ) : (
              // Custom Color Picker
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                  <Typography variant="subtitle2" color="silver">
                  {t("customColor")}
                  </Typography>
                  <Box 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      backgroundColor: rgbToHex(rgb.r, rgb.g, rgb.b),
                      border: '1px solid white'
                    }} 
                  />
                </Box>

                {/* RGB Sliders */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="silver">
                    {t("red")}: {rgb.r}
                  </Typography>
                  <Slider
                    value={rgb.r}
                    onChange={(_, value) => handleRgbChange('r', value as number)}
                    min={0}
                    max={255}
                    sx={{
                      color: '#ff5252',
                      height: 8,
                      '& .MuiSlider-thumb': {
                        width: 16,
                        height: 16,
                      }
                    }}
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="silver">
                  {t("green")}: {rgb.g}
                  </Typography>
                  <Slider
                    value={rgb.g}
                    onChange={(_, value) => handleRgbChange('g', value as number)}
                    min={0}
                    max={255}
                    sx={{
                      color: '#4caf50',
                      height: 8,
                      '& .MuiSlider-thumb': {
                        width: 16,
                        height: 16,
                      }
                    }}
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="silver">
                  {t("blue")}: {rgb.b}
                  </Typography>
                  <Slider
                    value={rgb.b}
                    onChange={(_, value) => handleRgbChange('b', value as number)}
                    min={0}
                    max={255}
                    sx={{
                      color: '#2196f3',
                      height: 8,
                      '& .MuiSlider-thumb': {
                        width: 16,
                        height: 16,
                      }
                    }}
                  />
                </Box>
                
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <IconButton 
                    onClick={toggleCustomColorPicker}
                    sx={{
                      border: '1px dashed silver',
                      p: 1,
                      borderRadius: 1,
                      color: 'silver',
                      '&:hover': {
                        color: 'white',
                        borderColor: 'white'
                      }
                    }}
                  >
                    <Typography variant="caption">{t("backToColorMap")}</Typography>
                  </IconButton>
                </Box>
              </Box>
            )}
          </Box>

          {/* Emojis Tab Panel */}
          <Box 
            role="tabpanel" 
            hidden={tabValue !== 1} 
            sx={{ 
              p: 2, 
              overflowY: 'auto',
              maxHeight: 340 
            }}
          >
            {emojiCategories.map((category, categoryIdx) => (
              <Box key={category.name} sx={{ mb: 2 }}>
                <Typography 
                  variant="subtitle2" 
                  color="silver" 
                  gutterBottom
                  sx={{ 
                    fontSize: '0.75rem',
                    borderBottom: '1px solid rgba(192, 192, 192, 0.2)',
                    pb: 0.5,
                    mb: 1
                  }}
                >
                  {category.name}
                </Typography>
                
                <Grid container spacing={1}>
                  {category.emojis.map((emojiOption, emojiIdx) => (
                    <Grid item key={`${categoryIdx}-${emojiIdx}-${emojiOption}`}>
                      <IconButton 
                        onClick={() => handleEmojiSelect(emojiOption)}
                        sx={{
                          width: 36,
                          height: 36,
                          border: currentEmoji === emojiOption ? '2px solid white' : '1px solid rgba(255,255,255,0.3)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.1)',
                          }
                        }}
                      >
                        <Typography sx={{ fontSize: '16px' }}>
                          {emojiOption}
                        </Typography>
                      </IconButton>
                    </Grid>
                  ))}
                </Grid>
                
                {categoryIdx < emojiCategories.length - 1 && (
                  <Divider sx={{ mt: 1, borderColor: 'rgba(192, 192, 192, 0.1)' }} />
                )}
              </Box>
            ))}
          </Box>
        </Paper>
      </Popover>
    </Box>
  );
};