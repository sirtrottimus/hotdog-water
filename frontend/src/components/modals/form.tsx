import { Alert, Modal, Text, Title } from '@mantine/core';

const FormModal = ({
  state,
  send,
}: {
  state: any;
  send: (event: any) => void;
}) => {
  const handleClose = () => {
    send('CLOSE');
  };
  return (
    <Modal
      withinPortal
      opened={state.matches('open')}
      onClose={handleClose}
      title={<Title order={4}>{state.context.title}</Title>}
      size={state.context.size ?? 'md'}
    >
      {state.context.element || (
        <Alert color="red" title="Error">
          <Text>The content couldn&apos;t be found...</Text>
        </Alert>
      )}
    </Modal>
  );
};

export default FormModal;
