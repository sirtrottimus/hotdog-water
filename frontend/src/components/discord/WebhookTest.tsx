// TableRow.js
import { MRT_Row } from 'mantine-react-table';
import { useState } from 'react';
import { APIResponse } from '../../utils/types';
import { Alert, Button } from '@mantine/core';
import { Prism } from '@mantine/prism';
import DiscordService, {
  DiscordSettingsInt,
} from '../../utils/api/DiscordService';

const WebhookTest = ({ row }: { row: MRT_Row<DiscordSettingsInt> }) => {
  const [webhookResult, setWebhookResult] = useState<APIResponse<any> | null>(
    null
  );
  const [testLoading, setTestLoading] = useState(false);

  const handleTestWebhook = async (row: MRT_Row<DiscordSettingsInt>) => {
    // Make the webhook test request and store the result in webhookResult state.
    // You can use fetch or any other method to perform the webhook test.
    const result = await DiscordService.sendTestMessage(
      {
        identifier: row.original.identifier,
        botName: row.original.botName,
        webhookURL: row.original.webhookURL,
        _id: row.original._id,
        isAnnouncementWebhook: row.original.isAnnouncementWebhook,
        isLivePostWebhook: row.original.isLivePostWebhook,
        isMemberOnlyWebhook: row.original.isMemberOnlyWebhook,
      },
      {
        content: 'Test Message',
      }
    );
    setWebhookResult(result);
  };

  return (
    <>
      <Button
        onClick={async () => {
          setTestLoading(true);
          handleTestWebhook(row);
          setTestLoading(false);
        }}
        loading={testLoading}
        color="violet"
      >
        Test Webhook
      </Button>

      {webhookResult && (
        <>
          <Alert color={webhookResult.success ? 'green' : 'red'} mt={10}>
            {webhookResult.success
              ? 'Success: Webhook sent successfully. Check Discord for the message.'
              : 'Error: Something went wrong, check console for more info.'}
          </Alert>
          <Prism language="json" noCopy mt={5}>
            {JSON.stringify(webhookResult, null, 2)}
          </Prism>
        </>
      )}
    </>
  );
};

export default WebhookTest;
