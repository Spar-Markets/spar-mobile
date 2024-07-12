import { View, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native'
import React, { useRef, useState } from 'react'
import { useTheme } from '../ContextComponents/ThemeContext';
import { useDimensions } from '../ContextComponents/DimensionsContext';
import createHomeStyles from '../../styles/createHomeStyles';
import PageHeader from '../GlobalComponents/PageHeader';
import { TextInput } from 'react-native-gesture-handler';
import CreateWatchlistButton from './CreateWatchlistButton';



const CreateList = () => {

    const { theme } = useTheme();
    const { width, height } = useDimensions();
    const styles = createHomeStyles(theme, width);

    const nameRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false)
    const [name, setName] = useState("")

    const emojis = [
        // Fitting Emojis
        '📈', '📉', '💹', '💲', '💰', '🏦', '📊', '💸', '🏷️', '💵',
        '💳', '💷', '💶', '💴', '💼', '🪙', '🧮', '📜', '📋', '📁',
        '📂', '🗂️', '📄', '🗃️', '📑', '🖥', '🖨', '📠', '📞', '☎️',
        '📟', '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '📯',
        '📃', '📌', '📍', '📎', '📏', '📐', '✂️', '🖇', '🖊', '🖋',
        '🖌', '🖍', '📝', '✏️', '✒️', '📏', '📆', '📅', '📇', '📋',

        // Face Emojis
        '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊',
        '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '🙂', '🤗',
        '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥',
        '😮', '🤐', '😯', '😪', '😫', '🥱', '😴', '😌', '😛', '😜',
        '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️',
        '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨',
        '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵',
        
        // Random Emojis
        '🐶', '🍔', '⚽', '🎸', '🚀', '🏖️', '🍕', '🎲', '🏆', '🎯',
        '🎮', '🎰', '🛹', '🏀', '🎳', '🥇', '🥈', '🥉', '🏅', '🎖️',
        '🎭', '🎨', '🧩', '🧸', '🪀', '🪁', '♟️', '🎴', '🃏', '🀄',
        '🎪', '🧿', '🎤', '🎧', '🎼', '🎹', '🎷', '🎺', '🎻', '🥁',
        '🪕', '🪗', '🎬', '🎨', '🎭', '🎤', '🎧', '🎼', '🎹', '🎷'
    ];

      interface EmojiPickerProps {
        onSelectEmoji: (emoji: string) => void;
      }
      
      const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelectEmoji }) => {
        const numColumns = 5; // Number of emojis per row
      
        // Split emojis into rows
        const emojiRows = [];
        for (let i = 0; i < emojis.length; i += numColumns) {
          emojiRows.push(emojis.slice(i, i + numColumns));
        }
      
        return (
          <View style={{ marginTop: 10 }}>
            <ScrollView horizontal contentContainerStyle={styles.scrollContainer}>
              {emojiRows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.column}>
                  {row.map((emoji, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => onSelectEmoji(emoji)}
                      style={[styles.emojiContainer, emoji == selectedEmoji && {backgroundColor: theme.colors.tertiary}]}
                    >
                      <Text style={styles.emoji}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        );
      };

      const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
      const handleSelectEmoji = (emoji: string) => {
        console.log(emoji)
        setSelectedEmoji(emoji);
      };

    return (
        <View style={styles.container}>
            <PageHeader text="Create List"/>
            <View style={[styles.inputContainer, isFocused && {borderColor: theme.colors.accent}, {marginHorizontal: 20, marginTop: 20}]}>
                <Text style={styles.textInputType}>List Name</Text>
                <TextInput
                ref={nameRef}
                placeholderTextColor={theme.colors.tertiary}
                onChangeText={setName}
                value={name}
                style={styles.inputText}
                selectionColor={theme.colors.accent}
                maxLength={25}
                autoFocus={true} // Auto focus the email input field
                autoCapitalize='none'
                onFocus={() => setIsFocused(true)} // Set focus state
                onBlur={() => setIsFocused(false)}
                />
          </View>
          <View style={{marginHorizontal: 20, marginTop: 20}}>
            <Text style={{fontFamily: "InterTight-Black", color: theme.colors.text, fontSize: 15}}>Select an Icon</Text>
          </View>
          <View style={{flex: 1, marginHorizontal: 20}}>
            <EmojiPicker onSelectEmoji={handleSelectEmoji} />
          </View>
          <View style={{marginBottom: 50}}>
            <CreateWatchlistButton watchListName={name} watchListIcon={selectedEmoji} onCreateListPage={true}/>
          </View>

        </View>
    )
}

export default CreateList