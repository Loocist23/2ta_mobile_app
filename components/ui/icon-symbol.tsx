// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
    'house.fill': 'home',
    'paperplane.fill': 'send',
    'chevron.left.forwardslash.chevron.right': 'code',
    'chevron.left': 'chevron-left',
    'chevron.right': 'chevron-right',
    'bell.badge.fill': 'notifications-active',
    'briefcase.fill': 'work',
    'globe.europe.africa.fill': 'public',
    'tray.full.fill': 'inbox',
    'person.crop.circle.badge.checkmark': 'verified-user',
    'g.circle.fill': 'google',
    'doc.text.fill': 'description',
    'bookmark.fill': 'bookmark',
    'gearshape.fill': 'settings',
    'person.crop.circle': 'person',
    'calendar.badge.clock': 'event-available',
    'chart.bar.fill': 'bar-chart',
    'star.fill': 'star',
    'list.bullet.rectangle': 'list',
    'envelope.fill': 'mail',
    'arrow.right.circle.fill': 'arrow-forward',
    'checkmark.seal.fill': 'verified',
    'lock.fill': 'lock',
    'key.fill': 'vpn-key',
    'a.login': 'login',
    applelogo: 'apple',
} as unknown as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
