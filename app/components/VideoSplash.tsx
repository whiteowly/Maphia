import { ResizeMode, Video } from 'expo-av';
import { StyleSheet, View } from 'react-native';

interface VideoSplashProps {
    onFinish: () => void;
}

export default function VideoSplash({ onFinish }: VideoSplashProps) {
    return (
        <View style={styles.container}>
            <Video
                style={styles.video}
                source={require('../../assets/videos/Maphia.mp4')}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping={false}
                onPlaybackStatusUpdate={(status) => {
                    if (status.isLoaded && status.didJustFinish) {
                        onFinish();
                    }
                }}
                onError={(error) => {
                    console.warn("Video splash error:", error);
                    onFinish(); // Skip if error
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
    },
});
