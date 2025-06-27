import { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet, View } from "react-native";
//prettier-ignore
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { useTheme } from "../contexts/ThemeContext";

const RichTextEditor = forwardRef(({ onChange }, ref) => {
  const editorRef = useRef();
  const { theme } = useTheme();

  // Forward the ref to the editorRef
  useImperativeHandle(ref, () => ({
    focus: () => {
      editorRef.current?.focus();
    },
    blur: () => {
      editorRef.current?.blur();
    },
    setContentHTML: (html) => {
      editorRef.current?.setContentHTML(html);
    },
    // Add any other methods you need to expose
  }));

  return (
    <View style={{ minHeight: 285 }}>
      <RichToolbar
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.insertLink,
          actions.keyboard,
          actions.setStrikethrough,
          actions.setUnderline,
          actions.removeFormat,
          actions.checkboxList,
          actions.undo,
          actions.redo,
        ]}
        style={[
          styles.richBar,
          {
            borderTopRightRadius: theme.radius.large,
            borderTopLeftRadius: theme.radius.large,
            backgroundColor: theme.colors.darkLight,
            borderColor: theme.colors.text,
            borderWidth: 1,
            borderBottomWidth: 0,
          },
        ]}
        flatContainerStyle={styles.listStyle}
        selectedIconTint={theme.colors.primary}
        iconTint={theme.colors.text}
        editor={editorRef}
        disabled={false}
      />

      <RichEditor
        ref={editorRef}
        containerStyle={[
          styles.rich,
          {
            borderBottomLeftRadius: theme.radius.large,
            borderBottomRightRadius: theme.radius.large,
            borderColor: theme.colors.text,
            backgroundColor: theme.colors.background,
          },
        ]}
        editorStyle={{
          color: theme.colors.text,
          backgroundColor: theme.colors.background,
          placeholderColor: theme.colors.textLight,
          contentCSSText: `font-size: 16px; color: ${theme.colors.text}; background: ${theme.colors.background};`,
        }}
        placeholder={"Co masz na myśli?"}
        onChange={onChange}
      />
    </View>
  );
});

export default RichTextEditor;

const styles = StyleSheet.create({
  richBar: {},
  rich: {
    minHeight: 285,
    flex: 1,
    borderWidth: 1,
    borderTopWidth: 0,

    padding: 10,
  },
  contentStyle: {
    // Add any additional styles for the editor content here
  },
  listStyle: {
    // Styles for the rich toolbar
  },
});
