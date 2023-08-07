import { Badge } from '@mantine/core';
import React from 'react';
import { PermissionInt } from '../../utils/types';

function color(status: string) {
  switch (true) {
    case status.includes('READ'):
      return 'blue';
    case status.includes('CREATE'):
      return 'green';
    case status.includes('UPDATE'):
      return 'yellow';
    case status.includes('DELETE'):
      return 'red';
    case status.includes('ADMIN'):
    case status.includes('SUPERADMIN'):
    case status.includes('MODERATOR'):
      return 'teal';
    default:
      return 'gray';
  }
}
type GroupedObjects = {
  name: string;
  objects: PermissionInt[];
};

function sortAndGroupObjectsByKeywords(
  objects: PermissionInt[],
  keywords: string[],
  groupNames: string[]
): (GroupedObjects | { name: string; objects: PermissionInt[] })[] {
  const groupedObjects: PermissionInt[][] = [];
  const unmatchedObjects: PermissionInt[] = [];

  keywords.forEach((keyword) => {
    const matchedObjects: PermissionInt[] = [];

    objects.forEach((obj) => {
      if (obj.name.includes(keyword)) {
        matchedObjects.push(obj);
      }
    });

    if (matchedObjects.length > 0) {
      groupedObjects.push(matchedObjects);
    }
  });

  objects.forEach((obj) => {
    let isMatched = false;

    groupedObjects.forEach((group) => {
      if (group.includes(obj)) {
        isMatched = true;
      }
    });

    if (!isMatched) {
      unmatchedObjects.push(obj);
    }
  });

  const result: (
    | GroupedObjects
    | { name: string; objects: PermissionInt[] }
  )[] = [];
  groupedObjects.forEach((group, index) => {
    if (group.length > 0) {
      const groupName = groupNames[index] || `Group ${index + 1}`;
      result.push({ name: groupName, objects: group });
    }
  });

  if (unmatchedObjects.length > 0) {
    result.push({ name: 'Misc', objects: unmatchedObjects });
  }

  return result;
}

const StatusCell = ({ row }: any) => {
  const sortedPermissions = sortAndGroupObjectsByKeywords(
    row.original.permissions,
    ['READ_', 'CREATE_', 'UPDATE_', 'DELETE_'],
    ['Read', 'Create', 'Update', 'Delete']
  );

  return (
    <>
      {/* {sortedPermissions.map((permission: any) => (
        <Badge
          radius={'xs'}
          color={color(permission.name)}
          key={permission._id}
          mx={1}
        >
          {permission.name}
        </Badge>
      ))} */}
      {sortedPermissions.map((group: any) => (
        <div
          key={group.name}
          style={{
            marginBottom: '15px',
          }}
        >
          {group.objects.map((permission: any) => (
            <Badge
              radius={'xs'}
              color={color(permission.name)}
              key={permission._id}
              mx={1}
            >
              {permission.name}
            </Badge>
          ))}
        </div>
      ))}
    </>
  );
};

export default StatusCell;
