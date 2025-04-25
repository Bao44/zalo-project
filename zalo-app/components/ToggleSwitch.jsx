
import { View, Switch, StyleSheet } from 'react-native';

const ToggleSwitch = ({ onPress, isEnabled, setIsEnabled }) => {

    const toggleSwitch = async () => {
        setIsEnabled(!isEnabled);
        await onPress(); // Gọi hàm onPress để thay đổi cài đặt duyệt
    };

    return (
        <View style={styles.container}>
            <Switch
                trackColor={{ false: '#e0e0e0', true: '#b3d4fc' }} // Gray nhạt (false), primary nhạt (true)
                thumbColor={isEnabled ? '#ffffff' : '#e0e0e0'} // Gray nhạt (true), trắng (false)
                ios_backgroundColor="#e0e0e0" // Gray nhạt cho iOS
                onValueChange={toggleSwitch}
                value={isEnabled}
                style={styles.switch}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    switch: {
        transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
    },
});

export default ToggleSwitch;