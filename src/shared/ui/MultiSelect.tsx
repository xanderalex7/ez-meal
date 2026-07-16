import { useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useI18n } from '../i18n';
import { radii, spacing, useAppColors } from '../theme';

const OPTION_HEIGHT = 44;
const MAX_VISIBLE_OPTIONS = 6;

type MultiSelectOption = {
  id: string;
  label: string;
};

type MultiSelectProps = {
  label: string;
  onChange: (selectedIds: string[]) => void;
  options: MultiSelectOption[];
  selectedIds: string[];
  showSelectedChips?: boolean;
};

export function MultiSelect({
  label,
  onChange,
  options,
  selectedIds,
  showSelectedChips = true,
}: MultiSelectProps) {
  const colors = useAppColors();
  const { t } = useI18n();
  const inputRef = useRef<TextInput>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isWeb = Platform.OS === 'web';
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [keyboardEnabled, setKeyboardEnabled] = useState(isWeb);
  const selectedOptions = options.filter((option) => selectedIds.includes(option.id));
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredOptions = useMemo(
    () =>
      normalizedQuery.length === 0
        ? options
        : options.filter((option) => option.label.toLocaleLowerCase().includes(normalizedQuery)),
    [normalizedQuery, options],
  );

  function toggle(id: string) {
    cancelScheduledClose();
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  }

  function cancelScheduledClose() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function scheduleClose() {
    cancelScheduledClose();
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      setKeyboardEnabled(isWeb);
      closeTimerRef.current = null;
    }, 120);
  }

  function openSearch() {
    cancelScheduledClose();
    if (isWeb) {
      setIsOpen(true);
      return;
    }

    if (!isOpen) {
      setKeyboardEnabled(false);
      setIsOpen(true);
      return;
    }

    if (!keyboardEnabled) {
      setKeyboardEnabled(true);
      requestAnimationFrame(() => {
        inputRef.current?.blur();
        inputRef.current?.focus();
      });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        ref={inputRef}
        accessibilityLabel={t('multiselectSearchA11y', { label })}
        onChangeText={(nextQuery) => {
          cancelScheduledClose();
          setQuery(nextQuery);
          setIsOpen(true);
          setKeyboardEnabled(true);
        }}
        onBlur={scheduleClose}
        onFocus={() => {
          cancelScheduledClose();
          setIsOpen(true);
        }}
        onPressIn={openSearch}
        placeholder={t('multiselectSearchPlaceholder')}
        placeholderTextColor={colors.textMuted}
        showSoftInputOnFocus={keyboardEnabled}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: isOpen ? colors.primary : colors.border,
            color: colors.text,
          },
        ]}
        value={query}
      />
      {showSelectedChips && selectedOptions.length > 0 ? (
        <View style={styles.selectedList}>
          {selectedOptions.map((option) => (
            <Pressable
              key={option.id}
              accessibilityLabel={t('multiselectRemoveA11y', { label: option.label })}
              accessibilityRole="button"
              onPress={() => toggle(option.id)}
              style={[
                styles.selectedChip,
                { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.selectedChipText, { color: colors.text }]}>{option.label}</Text>
              <Text style={[styles.removeMark, { color: colors.textMuted }]}>x</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {isOpen ? (
        <View
          onStartShouldSetResponder={() => {
            cancelScheduledClose();
            return false;
          }}
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              maxHeight: OPTION_HEIGHT * MAX_VISIBLE_OPTIONS,
            },
          ]}
        >
          {filteredOptions.length > 0 ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              style={{ maxHeight: OPTION_HEIGHT * MAX_VISIBLE_OPTIONS }}
            >
              {filteredOptions.map((option) => {
                const selected = selectedIds.includes(option.id);
                return (
                  <Pressable
                    key={option.id}
                    accessibilityLabel={option.label}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    onPress={() => toggle(option.id)}
                    style={[
                      styles.option,
                      {
                        backgroundColor: selected ? colors.surfaceAlt : colors.surface,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: selected ? colors.primary : 'transparent',
                          borderColor: selected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      {selected ? <Text style={[styles.check, { color: colors.surface }]}>✓</Text> : null}
                    </View>
                    <Text style={[styles.optionLabel, { color: colors.text }]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <Text style={[styles.empty, { color: colors.textMuted }]}>{t('multiselectEmpty')}</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  selectedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  selectedChip: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 32,
    paddingHorizontal: spacing.md,
  },
  selectedChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  removeMark: {
    fontSize: 13,
    fontWeight: '700',
  },
  dropdown: {
    borderRadius: radii.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  option: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: OPTION_HEIGHT,
    paddingHorizontal: spacing.md,
  },
  checkbox: {
    alignItems: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  check: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    fontSize: 14,
    padding: spacing.md,
  },
});
