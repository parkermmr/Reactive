import { styled } from '@mui/material/styles';
import { HexColorPicker } from 'react-colorful';
import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  Tabs,
  Tab,
  Grid,
  Divider,
  Select,
  MenuItem
} from '@mui/material';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { toggleButtonGroupClasses } from '@mui/material/ToggleButtonGroup';
import React, { useRef, useState } from 'react';
import { Editor, EditorState, RichUtils, Modifier } from 'draft-js';

const ToolbarContainer = styled(Paper)(() => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'nowrap',
  border: `1px solid #ccc`,
  padding: '4px',
  marginBottom: '8px'
}));

const SWATCH_COLORS = [
  '#000000','#888888','#CCCCCC','#FFFFFF','#FF0000','#FF6666','#FFA500','#FFFF00',
  '#00FF00','#00FFFF','#0000FF','#800080','#FFC0CB','#808000','#800000','#008080',
  '#808080','#C0C0C0','#FFD700','#008000','#000080','#FF00FF','#E6E6FA','#FF1493'
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  [`& .${toggleButtonGroupClasses.grouped}`]: {
    margin: theme.spacing(0.5),
    border: 0,
    borderRadius: theme.shape.borderRadius,
    [`&.${toggleButtonGroupClasses.disabled}`]: {
      border: 0,
    },
  },
  [`& .${toggleButtonGroupClasses.middleButton}, & .${toggleButtonGroupClasses.lastButton}`]: {
    marginLeft: -1,
    borderLeft: '1px solid transparent',
  },
}));

const baseStyleMap: Record<string, React.CSSProperties> = {
  BOLD: { fontWeight: 'bold' },
  ITALIC: { fontStyle: 'italic' },
  UNDERLINE: { textDecoration: 'underline' },
  ALIGNLEFT: { textAlign: 'left' },
  ALIGNCENTER: { textAlign: 'center' },
  ALIGNRIGHT: { textAlign: 'right' },
  ALIGNJUSTIFY: { textAlign: 'justify' },
};

SWATCH_COLORS.forEach(color => {
  baseStyleMap[`COLOR_${color.toUpperCase()}`] = { color };
});

export default function Textbox() {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [colorAnchor, setColorAnchor] = useState<HTMLElement | null>(null);
  const [colorPickerTab, setColorPickerTab] = useState(0);
  const [tempColor, setTempColor] = useState('#000000');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(12);
  const editorRef = useRef<Editor>(null);

  const getCustomStyleMap = () => {
    const customMap = { ...baseStyleMap };
    FONT_SIZES.forEach(sz => {
      customMap[`FONTSIZE_${sz}`] = { fontSize: `${sz}px` };
    });
    return customMap;
  };

  const blockStyleFn = (contentBlock: any): string => {
    const type = contentBlock.getType();
    if (type === 'left') return 'ALIGNLEFT';
    if (type === 'center') return 'ALIGNCENTER';
    if (type === 'right') return 'ALIGNRIGHT';
    if (type === 'justify') return 'ALIGNJUSTIFY';
    return '';
  };

  const changeAlignment = (
      _: React.MouseEvent<HTMLElement>,
      newAlignment: 'left' | 'center' | 'right' | 'justify'
    ) => {
    if (newAlignment !== null && newAlignment !== alignment) {
      setAlignment(newAlignment);
    }
  };

  const handleInlineStyle = (style: string) => (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    editorRef.current?.focus();
  };

  const removeColorStyles = (state: EditorState) => {
    let content = state.getCurrentContent();
    const selection = state.getSelection();
    SWATCH_COLORS.forEach(sw => {
      content = Modifier.removeInlineStyle(content, selection, `COLOR_${sw.toUpperCase()}`);
    });
    return EditorState.set(state, { currentContent: content });
  };

  const toggleColor = (color: string) => {
    const sel = editorState.getSelection();
    let newState = removeColorStyles(editorState);
    newState = RichUtils.toggleInlineStyle(newState, `COLOR_${color.toUpperCase()}`);
    setEditorState(EditorState.forceSelection(newState, sel));
    setCurrentColor(color);
  };

  const applyFontSize = (sz: number) => {
    const selection = editorState.getSelection();
    let content = editorState.getCurrentContent();
    FONT_SIZES.forEach(s => {
      content = Modifier.removeInlineStyle(content, selection, `FONTSIZE_${s}`);
    });
    let newState = EditorState.set(editorState, { currentContent: content });
    newState = RichUtils.toggleInlineStyle(newState, `FONTSIZE_${sz}`);
    setEditorState(newState);
    setFontSize(sz);
  };

  return (
    <>
     <Box>
        <ToolbarContainer elevation={0}>
          <StyledToggleButtonGroup
            size="small"
            value={alignment}
            exclusive
            onChange={changeAlignment}
            aria-label="text alignment"
          >
            <ToggleButton value="left" aria-label="left aligned">
              <FormatAlignLeftIcon />
            </ToggleButton>
            <ToggleButton value="center" aria-label="centered">
              <FormatAlignCenterIcon />
            </ToggleButton>
            <ToggleButton value="right" aria-label="right aligned">
              <FormatAlignRightIcon />
            </ToggleButton>
            <ToggleButton value="justify" aria-label="justified">
              <FormatAlignJustifyIcon />
            </ToggleButton>
          </StyledToggleButtonGroup>

          <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

          <StyledToggleButtonGroup size="small" aria-label="text formatting">
            <ToggleButton
              value="bold"
              selected={editorState.getCurrentInlineStyle().has('BOLD')}
              onMouseDown={handleInlineStyle('BOLD')}
            >
              <FormatBoldIcon />
            </ToggleButton>
            <ToggleButton
              value="italic"
              selected={editorState.getCurrentInlineStyle().has('ITALIC')}
              onMouseDown={handleInlineStyle('ITALIC')}
            >
              <FormatItalicIcon />
            </ToggleButton>
            <ToggleButton
              value="underline"
              selected={editorState.getCurrentInlineStyle().has('UNDERLINE')}
              onMouseDown={handleInlineStyle('UNDERLINE')}
            >
              <FormatUnderlinedIcon />
            </ToggleButton>
          </StyledToggleButtonGroup>

          <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

          <StyledToggleButtonGroup>
          <ToggleButton
            value="color"
            onMouseDown={e => { e.preventDefault(); setColorAnchor(e.currentTarget); }}
          >
            <FormatColorFillIcon sx={{ color: currentColor }} />
            <ArrowDropDownIcon />
          </ToggleButton>
        </StyledToggleButtonGroup>

        <Menu
          anchorEl={colorAnchor}
          open={Boolean(colorAnchor)}
          onClose={() => setColorAnchor(null)}
          sx={{ '& .MuiPaper-root': { p: 1 } }}
        >
          <Tabs
            value={colorPickerTab}
            onChange={(_, val) => setColorPickerTab(val)}
            variant="fullWidth"
          >
            <Tab label="Standard" />
            <Tab label="Custom" />
          </Tabs>
          {colorPickerTab === 0 ? (
            <Box sx={{ width: 220, p: 1 }}>
              <Grid container spacing={1}>
                {SWATCH_COLORS.map(c => (
                  <Grid item xs={3} key={c}>
                    <Box
                      onClick={() => {
                        toggleColor(c);
                        setColorAnchor(null);
                      }}
                      sx={{
                        width: 24,
                        height: 24,
                        border: '1px solid #ccc',
                        bgcolor: c,
                        cursor: 'pointer'
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <HexColorPicker color={tempColor} onChange={setTempColor} />
              <ToggleButton
                value="apply"
                sx={{ mt: 1 }}
                onClick={() => {
                  toggleColor(tempColor);
                  setColorAnchor(null);
                }}
              >
                Apply
              </ToggleButton>
            </Box>
          )}
        </Menu>

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

        <StyledToggleButtonGroup>
          <ToggleButton
            value="decrease"
            onMouseDown={e => {
              e.preventDefault();
              const idx = FONT_SIZES.indexOf(fontSize);
              if (idx > 0) applyFontSize(FONT_SIZES[idx - 1]);
            }}
          >
            <TextDecreaseIcon />
          </ToggleButton>
          <ToggleButton
            value="increase"
            onMouseDown={e => {
              e.preventDefault();
              const idx = FONT_SIZES.indexOf(fontSize);
              if (idx < FONT_SIZES.length - 1) applyFontSize(FONT_SIZES[idx + 1]);
            }}
          >
            <TextIncreaseIcon />
          </ToggleButton>
        </StyledToggleButtonGroup>

        <Select
          variant="standard"
          disableUnderline
          sx={{ ml: 2 }}
          value={fontSize}
          onChange={e => applyFontSize(Number(e.target.value))}
        >
          {FONT_SIZES.map(sz => (
            <MenuItem key={sz} value={sz}>
              {sz} pt
            </MenuItem>
          ))}
        </Select>
        </ToolbarContainer>

        <div>
          <Box
            sx={(theme) => ({
              minHeight: 200,
              p: 1,
              cursor: 'text',
              textAlign: alignment,
              border: `1px solid ${theme.palette.divider}`,
              flexWrap: 'wrap',
            })}
            onClick={() => editorRef.current?.focus()}
          >
            <Editor
              ref={editorRef}
              editorState={editorState}
              onChange={setEditorState}
              customStyleMap={getCustomStyleMap()}
              blockStyleFn={blockStyleFn}
            />
          </Box>
        </div>
     </Box>
    </>
  );
}