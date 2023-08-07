import { useMantineTheme } from '@mantine/core';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';

import StarterKit from '@tiptap/starter-kit';

export function TextEditor({
  content,
  handleChange,
}: {
  content: string;
  handleChange: Function;
}) {
  const theme = useMantineTheme();

  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: content,
    editorProps: {
      attributes: {
        class: 'mantine-tiptap-editor',
        style: 'min-height: 200px;',
      },
    },
    onUpdate({ editor }) {
      handleChange(editor.getText());
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
  });

  return (
    <>
      <RichTextEditor
        editor={editor}
        style={{
          border: `2px solid ${
            theme.colorScheme === 'dark'
              ? theme.colors.dark[4]
              : theme.colors.gray[4]
          }
      `,
        }}
      >
        <RichTextEditor.Toolbar
          sticky
          stickyOffset={60}
          style={{
            borderBottom: `2px solid ${
              theme.colorScheme === 'dark'
                ? theme.colors.dark[4]
                : theme.colors.gray[4]
            }
      `,
          }}
        >
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.ClearFormatting />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor>
    </>
  );
}
