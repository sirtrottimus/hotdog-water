import { Overlay } from '@mantine/core';
import React from 'react';

function BlurWrapper({
  isBlurred,
  children,
}: {
  isBlurred: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {isBlurred && <Overlay opacity={0.2} zIndex={1000} blur={7} />}
    </>
  );
}

export default BlurWrapper;
