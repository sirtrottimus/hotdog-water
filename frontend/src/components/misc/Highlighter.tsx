import React, { forwardRef } from 'react';
import {
  MantineTheme,
  CSSObject,
  useComponentDefaultProps,
  DefaultMantineColor,
} from '@mantine/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import { Mark, Text, TextProps } from '@mantine/core';
import { highlighter } from '../../utils/helpers';

export interface HighlightProps extends TextProps {
  /** Substring or an array of substrings to highlight in children */
  highlight: string | string[];

  /** Color from theme that is used for highlighting */
  highlightColor?: DefaultMantineColor | DefaultMantineColor[];

  /** Styles applied to highlighted part */
  highlightStyles?: CSSObject | ((theme: MantineTheme) => CSSObject);

  /** Full string part of which will be highlighted */
  children: string;
}

const defaultProps: Partial<HighlightProps> = {
  highlightColor: 'yellow',
};

export const _Highlight = forwardRef<HTMLDivElement, HighlightProps>(
  (props, ref) => {
    const {
      children,
      highlight,
      highlightColor,
      highlightStyles,
      unstyled,
      ...others
    } = useComponentDefaultProps('Highlight', defaultProps, props);
    const highlightChunks = highlighter({
      value: children,
      _highlight: highlight,
      highlightColor: highlightColor,
    });


    return (
      <Text unstyled={unstyled} ref={ref} {...others}>
        {highlightChunks.map(function (
          { chunk, highlighted, highlightColor },
          i
        ): JSX.Element {
          return highlighted ? (
            <Mark
              unstyled={unstyled}
              key={i}
              color={highlightColor}
              sx={highlightStyles}
            >
              {chunk}
            </Mark>
          ) : (
            <span key={i}>{chunk}</span>
          );
        })}
      </Text>
    );
  }
);

_Highlight.displayName = '@mantine/core/Highlight';

export const Highlight = createPolymorphicComponent<'div', HighlightProps>(
  _Highlight
);
