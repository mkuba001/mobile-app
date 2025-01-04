import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  isPassword = false,
  otherStyles,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, otherStyles]}>
      {/* Tytuł pola */}
      <Text style={styles.label}>{title}</Text>

      {/* Kontener pola i ikony */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7B7B8B"
          onChangeText={handleChangeText}
          secureTextEntry={isPassword && !showPassword}
        />
        {/* Ikona oka do pokazywania/ukrywania hasła */}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconContainer}
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#E4E4E4",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E2C", 
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#333",
    paddingHorizontal: 16, 
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF", 
  },
  iconContainer: {
    paddingLeft: 12, 
  },
});
