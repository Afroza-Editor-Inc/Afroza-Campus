import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import FloatingAnchorMenu, { type FloatingMenuSection } from '../../../components/overlays/FloatingAnchorMenu';

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

type MessagingSidePanelMenuProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  sections: MenuSection[];
  onClose: () => void;
};

export default function MessagingSidePanelMenu({
  visible,
  title,
  subtitle,
  sections,
  onClose,
}: MessagingSidePanelMenuProps) {
  const mappedSections: FloatingMenuSection[] = sections.map((section) => ({
    title: section.title,
    items: section.items.map((item) => ({
      label: item.label,
      icon: item.icon,
      onPress: item.onPress,
    })),
  }));

  return (
    <FloatingAnchorMenu
      visible={visible}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      sections={mappedSections}
      anchor="top-right"
    />
  );
}
