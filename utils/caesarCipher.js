export const encrypt = (text, shift) => {
  return text
    .split('')
    .map(char => {
      const code = char.charCodeAt(0)
      if (code >= 65 && code <= 90) { // Uppercase letters
        return String.fromCharCode(((code - 65 + shift) % 26) + 65)
      } else if (code >= 97 && code <= 122) { // Lowercase letters
        return String.fromCharCode(((code - 97 + shift) % 26) + 97)
      }
      return char // Keep other characters unchanged
    })
    .join('')
}

export const decrypt = (text, shift) => {
  return encrypt(text, 26 - (shift % 26))
}

export const generateRandomShift = () => {
  return Math.floor(Math.random() * 25) + 1
} 