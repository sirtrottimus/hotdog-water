import React from 'react';

export interface EventInt {
  eventName: string;
  [key: string]: any;
}

export default function Activity(event: EventInt) {
  if (event.eventName === 'event:test') {
    return (
      <div>
        <p>Test Event Received: {event.data}</p>
      </div>
    );
  }
}
