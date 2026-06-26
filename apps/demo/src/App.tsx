import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { DelayInput } from "react-native-debounce-input";

interface LogEntry {
  id: number;
  value: string;
  at: string;
}

export function App() {
  const [delay, setDelay] = useState(600);
  const [minLength, setMinLength] = useState(3);
  const [externalValue, setExternalValue] = useState<string | undefined>(undefined);
  const [log, setLog] = useState<LogEntry[]>([]);

  const pushLog = (value: string) => {
    setLog((prev) =>
      [
        {
          id: prev.length ? prev[0]!.id + 1 : 1,
          value,
          at: new Date().toLocaleTimeString(),
        },
        ...prev,
      ].slice(0, 12),
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>react-native-debounce-input</Text>
        <Text style={styles.subtitle}>
          Type below — onChangeText fires {delay}ms after you stop (min length {minLength}).
        </Text>

        <DelayInput
          style={styles.input}
          placeholder="Search…"
          delay={delay}
          minLength={minLength}
          value={externalValue}
          onChangeText={pushLog}
        />

        <View style={styles.controls}>
          <Stepper
            label={`delay: ${delay}ms`}
            onMinus={() => setDelay((d) => Math.max(0, d - 100))}
            onPlus={() => setDelay((d) => d + 100)}
          />
          <Stepper
            label={`minLength: ${minLength}`}
            onMinus={() => setMinLength((m) => Math.max(0, m - 1))}
            onPlus={() => setMinLength((m) => m + 1)}
          />
        </View>

        <View style={styles.controls}>
          <Button label='Set value to "external"' onPress={() => setExternalValue("external")} />
          <Button label="Clear value" onPress={() => setExternalValue("")} />
        </View>

        <Text style={styles.sectionTitle}>Debounced fires</Text>
        {log.length === 0 ? (
          <Text style={styles.empty}>Nothing yet — start typing.</Text>
        ) : (
          log.map((entry) => (
            <View key={entry.id} style={styles.logRow}>
              <Text style={styles.logValue}>{entry.value === "" ? "∅ (empty)" : entry.value}</Text>
              <Text style={styles.logTime}>{entry.at}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function Stepper({
  label,
  onMinus,
  onPlus,
}: {
  label: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable style={styles.stepButton} onPress={onMinus}>
        <Text style={styles.stepButtonText}>−</Text>
      </Pressable>
      <Text style={styles.stepLabel}>{label}</Text>
      <Pressable style={styles.stepButton} onPress={onPlus}>
        <Text style={styles.stepButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

function Button({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {
    minHeight: "100%",
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 6, marginBottom: 18, color: "#6b7280", fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  controls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  stepButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  stepButtonText: { fontSize: 18, fontWeight: "700", color: "#374151" },
  stepLabel: { fontSize: 14, color: "#374151", minWidth: 96, textAlign: "center" },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#9ca3af",
  },
  empty: { color: "#9ca3af", fontStyle: "italic" },
  logRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  logValue: { fontSize: 15, color: "#111827", fontFamily: "monospace" },
  logTime: { fontSize: 13, color: "#9ca3af" },
});
