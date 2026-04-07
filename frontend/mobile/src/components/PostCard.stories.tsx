import React from 'react';
import { storiesOf } from '@storybook/react-native';
import PostCard from './PostCard';

storiesOf('PostCard', module)
  .add('default', () => <PostCard userName="Ahmed_StudentLeader" likes={128} caption="Bonjour campus!" />);
