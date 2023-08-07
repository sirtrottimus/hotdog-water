import { createMachine } from 'xstate';

const formMachine = createMachine(
  {
    id: 'form',
    initial: 'closed',
    predictableActionArguments: true,
    context: {
      title: '',
      form: '',
      data: {},
      size: 'md',
      element: null as JSX.Element | null,
    },
    states: {
      closed: {
        on: {
          OPEN: {
            target: 'open',
            actions: ['setParams'],
          },
        },
      },
      open: {
        on: {
          CLOSE: {
            target: 'closed',
            actions: ['sendClose'],
          },
        },
      },
    },
  },
  {
    actions: {
      setParams: (context, event) => {
        context.title = event.title;
        context.form = event.form;
        context.data = event.data;
        context.element = event.element;
        context.size = event.size;
      },
      sendClose: (context, event) => {},
    },
  }
);

export default formMachine;
