import { StyleSheet } from "react-native";

export const FOCUS_WIDTH = 330;
export const FOCUS_HEIGHT = 500;

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  cameraPreview: { ...StyleSheet.absoluteFillObject },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  focusFrame: {
    width: FOCUS_WIDTH,
    height: FOCUS_HEIGHT,
    borderWidth: 2,
    borderColor: "#FF9500", // Color diferenciado para modo foto (naranja)
    borderRadius: 16,
  },
  instruction: {
    color: "white",
    marginTop: 24,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  captureButtonContainer: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    zIndex: 10,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },

  reviewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  reviewCard: {
    width: "100%",
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 30,
    paddingBottom: 50,
  },
  reviewLabel: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  reviewInput: {
    color: "white",
    fontSize: 48,
    fontWeight: "900",
    borderBottomWidth: 3,
    borderBottomColor: "#FF9500",
    width: "100%",
    textAlign: "center",
    marginBottom: 30,
  },
  reviewActionGroup: { flexDirection: "row", gap: 15 },
  retryButton: {
    flex: 1,
    backgroundColor: "#3A3A3C",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  retryText: { color: "white", fontWeight: "bold" },
  confirmButton: {
    flex: 1,
    backgroundColor: "#34C759",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmText: { color: "white", fontWeight: "bold" },

  resultList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  resultItem: {
    backgroundColor: "#2C2C2E",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultTextRaw: {
    color: "#8E8E93",
    fontSize: 12,
  },
  resultTextClean: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
