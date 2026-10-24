package com.transitpulse.util;

import java.io.*;
import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

public class JsonUtils {

    // --- High Level Reading & Writing ---

    public static String readFileAsString(String filePath) throws IOException {
        byte[] bytes = Files.readAllBytes(Paths.get(filePath));
        return new String(bytes, StandardCharsets.UTF_8);
    }

    public static void writeStringToFile(String filePath, String content) throws IOException {
        Files.write(Paths.get(filePath), content.getBytes(StandardCharsets.UTF_8));
    }

    public static Object parseJson(String json) {
        if (json == null) return null;
        json = json.trim();
        return new JsonParser(json).parseValue();
    }

    @SuppressWarnings("unchecked")
    public static List<Map<String, Object>> parseJsonList(String json) {
        Object val = parseJson(json);
        if (val instanceof List) {
            return (List<Map<String, Object>>) val;
        }
        return new ArrayList<>();
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> parseJsonMap(String json) {
        Object val = parseJson(json);
        if (val instanceof Map) {
            return (Map<String, Object>) val;
        }
        return new HashMap<>();
    }

    // --- JSON Parser Implementation ---

    private static class JsonParser {
        private final String src;
        private int pos = 0;

        public JsonParser(String src) {
            this.src = src;
        }

        private void skipWhitespace() {
            while (pos < src.length()) {
                char c = src.charAt(pos);
                if (c == ' ' || c == '\t' || c == '\n' || c == '\r') {
                    pos++;
                } else if (c == '/' && pos + 1 < src.length() && src.charAt(pos + 1) == '/') {
                    while (pos < src.length() && src.charAt(pos) != '\n') pos++;
                } else {
                    break;
                }
            }
        }

        public Object parseValue() {
            skipWhitespace();
            if (pos >= src.length()) return null;

            char c = src.charAt(pos);
            if (c == '{') return parseObject();
            if (c == '[') return parseArray();
            if (c == '"' || c == '\'') return parseString();
            if (c == 't' || c == 'T' || c == 'f' || c == 'F') return parseBoolean();
            if (c == 'n' || c == 'N') return parseNull();
            if (c == '-' || (c >= '0' && c <= '9')) return parseNumber();

            throw new RuntimeException("Unexpected character at position " + pos + ": " + c);
        }

        private Map<String, Object> parseObject() {
            Map<String, Object> map = new LinkedHashMap<>();
            pos++; // skip '{'
            skipWhitespace();

            if (pos < src.length() && src.charAt(pos) == '}') {
                pos++;
                return map;
            }

            while (pos < src.length()) {
                skipWhitespace();
                String key = parseString();
                skipWhitespace();
                if (pos < src.length() && src.charAt(pos) == ':') {
                    pos++;
                } else {
                    throw new RuntimeException("Expected ':' at position " + pos);
                }
                Object val = parseValue();
                map.put(key, val);

                skipWhitespace();
                if (pos < src.length() && src.charAt(pos) == ',') {
                    pos++;
                    skipWhitespace();
                } else if (pos < src.length() && src.charAt(pos) == '}') {
                    pos++;
                    break;
                }
            }
            return map;
        }

        private List<Object> parseArray() {
            List<Object> list = new ArrayList<>();
            pos++; // skip '['
            skipWhitespace();

            if (pos < src.length() && src.charAt(pos) == ']') {
                pos++;
                return list;
            }

            while (pos < src.length()) {
                skipWhitespace();
                list.add(parseValue());
                skipWhitespace();
                if (pos < src.length() && src.charAt(pos) == ',') {
                    pos++;
                    skipWhitespace();
                } else if (pos < src.length() && src.charAt(pos) == ']') {
                    pos++;
                    break;
                }
            }
            return list;
        }

        private String parseString() {
            char quote = src.charAt(pos);
            pos++; // skip quote
            StringBuilder sb = new StringBuilder();

            while (pos < src.length()) {
                char c = src.charAt(pos);
                if (c == quote) {
                    pos++;
                    return sb.toString();
                }
                if (c == '\\') {
                    pos++;
                    if (pos < src.length()) {
                        char esc = src.charAt(pos);
                        switch (esc) {
                            case '"': sb.append('"'); break;
                            case '\\': sb.append('\\'); break;
                            case '/': sb.append('/'); break;
                            case 'b': sb.append('\b'); break;
                            case 'f': sb.append('\f'); break;
                            case 'n': sb.append('\n'); break;
                            case 'r': sb.append('\r'); break;
                            case 't': sb.append('\t'); break;
                            case 'u':
                                if (pos + 4 < src.length()) {
                                    String hex = src.substring(pos + 1, pos + 5);
                                    sb.append((char) Integer.parseInt(hex, 16));
                                    pos += 4;
                                }
                                break;
                            default: sb.append(esc); break;
                        }
                    }
                } else {
                    sb.append(c);
                }
                pos++;
            }
            return sb.toString();
        }

        private Boolean parseBoolean() {
            if (src.startsWith("true", pos) || src.startsWith("TRUE", pos)) {
                pos += 4;
                return Boolean.TRUE;
            }
            if (src.startsWith("false", pos) || src.startsWith("FALSE", pos)) {
                pos += 5;
                return Boolean.FALSE;
            }
            throw new RuntimeException("Expected boolean at position " + pos);
        }

        private Object parseNull() {
            if (src.startsWith("null", pos) || src.startsWith("NULL", pos)) {
                pos += 4;
                return null;
            }
            throw new RuntimeException("Expected null at position " + pos);
        }

        private Number parseNumber() {
            int start = pos;
            if (src.charAt(pos) == '-') pos++;
            while (pos < src.length() && (Character.isDigit(src.charAt(pos)) || src.charAt(pos) == '.' || src.charAt(pos) == 'e' || src.charAt(pos) == 'E' || src.charAt(pos) == '+' || src.charAt(pos) == '-')) {
                pos++;
            }
            String numStr = src.substring(start, pos);
            if (numStr.contains(".") || numStr.contains("e") || numStr.contains("E")) {
                return Double.parseDouble(numStr);
            }
            long l = Long.parseLong(numStr);
            if (l >= Integer.MIN_VALUE && l <= Integer.MAX_VALUE) {
                return (int) l;
            }
            return l;
        }
    }

    // --- JSON Serialization Implementation ---

    public static String toJson(Object obj) {
        StringBuilder sb = new StringBuilder();
        serialize(obj, sb, 0);
        return sb.toString();
    }

    @SuppressWarnings("unchecked")
    private static void serialize(Object obj, StringBuilder sb, int indent) {
        if (obj == null) {
            sb.append("null");
            return;
        }

        if (obj instanceof String) {
            sb.append("\"").append(escapeString((String) obj)).append("\"");
        } else if (obj instanceof Number || obj instanceof Boolean) {
            sb.append(obj.toString());
        } else if (obj instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) obj;
            sb.append("{\n");
            int i = 0;
            int size = map.size();
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                indent(sb, indent + 1);
                sb.append("\"").append(escapeString(String.valueOf(entry.getKey()))).append("\": ");
                serialize(entry.getValue(), sb, indent + 1);
                if (++i < size) sb.append(",");
                sb.append("\n");
            }
            indent(sb, indent);
            sb.append("}");
        } else if (obj instanceof Collection) {
            Collection<?> col = (Collection<?>) obj;
            sb.append("[\n");
            int i = 0;
            int size = col.size();
            for (Object item : col) {
                indent(sb, indent + 1);
                serialize(item, sb, indent + 1);
                if (++i < size) sb.append(",");
                sb.append("\n");
            }
            indent(sb, indent);
            sb.append("]");
        } else if (obj.getClass().isArray()) {
            Object[] arr = (Object[]) obj;
            sb.append("[\n");
            for (int i = 0; i < arr.length; i++) {
                indent(sb, indent + 1);
                serialize(arr[i], sb, indent + 1);
                if (i < arr.length - 1) sb.append(",");
                sb.append("\n");
            }
            indent(sb, indent);
            sb.append("]");
        } else {
            // Reflect POJO fields
            sb.append("{\n");
            Field[] fields = obj.getClass().getDeclaredFields();
            int validCount = 0;
            for (Field f : fields) {
                if (java.lang.reflect.Modifier.isStatic(f.getModifiers())) continue;
                validCount++;
            }
            int current = 0;
            for (Field f : fields) {
                if (java.lang.reflect.Modifier.isStatic(f.getModifiers())) continue;
                f.setAccessible(true);
                try {
                    indent(sb, indent + 1);
                    sb.append("\"").append(f.getName()).append("\": ");
                    serialize(f.get(obj), sb, indent + 1);
                    if (++current < validCount) sb.append(",");
                    sb.append("\n");
                } catch (Exception e) {
                    // skip or log
                }
            }
            indent(sb, indent);
            sb.append("}");
        }
    }

    private static void indent(StringBuilder sb, int level) {
        for (int i = 0; i < level; i++) {
            sb.append("  ");
        }
    }

    public static String escapeString(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < ' ') {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }
}
