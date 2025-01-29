import { useState, useRef } from "react";
import { Button } from "@mui/material";
import "./App.css";
import Textbox from "./components/Textbox";

function App() {
  const [formattedContent, setFormattedContent] = useState([]);
  const [isEditing, setIsEditing] = useState(true);
  const [editorContent, setEditorContent] = useState({
    alignment: "center",
    blocks: [
      {
        text: "Hello World",
        styles: [{ index: 0, style: "BOLD" }],
      },
    ],
  });

  const extractTextRef = useRef<(() => void) | null>(null);

  const handleSave = () => {
    if (extractTextRef.current) {
      extractTextRef.current(); 
    }
    setIsEditing(false); 
  };

  const handleExtractedText = (extractedText: any) => {
    if (extractedText.length === 0) return;
    setFormattedContent(extractedText);
    setEditorContent({ alignment: extractedText[0]?.alignment || "left", blocks: extractedText });
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {isEditing ? (
        <Textbox
          initialFormattedText={editorContent}
          onExtractText={handleExtractedText}
          isEditing={isEditing}
          setExtractTextRef={(fn) => (extractTextRef.current = fn)} 
        />
      ) : (
        <div style={{ border: "0px", padding: "10px", minHeight: "50px" }}>
          {formattedContent.map((block: { text: string; alignment: string; styles: { index: number; style: string }[] }, i) => (
            <p key={i} style={{ textAlign: block.alignment as React.CSSProperties['textAlign'], margin: "0", padding: "5px" }}>
              {block.text.split("").map((char, j) => {
                const styles = block.styles.filter((s) => s.index === j).map((s) => s.style);
                return (
                  <span key={j} style={getStyleFromInlineStyles(styles)}>
                    {char}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
      )}

      <div style={{ marginTop: "10px" }}>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        ) : (
          <Button onClick={handleSave}>Save</Button>
        )}
      </div>
    </div>
  );
}

const getStyleFromInlineStyles = (styles: string[]) => {
  const styleMap: Record<string, React.CSSProperties> = {
    BOLD: { fontWeight: "bold" },
    ITALIC: { fontStyle: "italic" },
    UNDERLINE: { textDecoration: "underline" },
  };
  const colorStyle = styles.find((s) => s.startsWith("COLOR_"));
  if (colorStyle) {
    styleMap[colorStyle] = { color: colorStyle.replace("COLOR_", "").toLowerCase() };
  }
  return styles.reduce((acc, style) => ({ ...acc, ...styleMap[style] }), {});
};

export default App;
