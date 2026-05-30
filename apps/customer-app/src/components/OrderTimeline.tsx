import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface TimelineItem {
  id: string;

  status: string;

  created_at: string;
}

interface Props {
  history: TimelineItem[];
}

export default function OrderTimeline({
  history,
}: Props) {
  return (
    <View
      style={
        styles.container
      }
    >
      {history.map(
        (
          item,
          index
        ) => (
          <View
            key={item.id}
            style={
              styles.timelineItem
            }
          >
            <View
              style={
                styles.leftSection
              }
            >
              <View
                style={
                  styles.dot
                }
              />

              {index !==
                history.length -
                  1 && (
                <View
                  style={
                    styles.line
                  }
                />
              )}
            </View>

            <View
              style={
                styles.content
              }
            >
              <Text
                style={
                  styles.status
                }
              >
                {item.status
                  .replaceAll(
                    '_',
                    ' '
                  )
                  .toUpperCase()}
              </Text>

              <Text
                style={
                  styles.date
                }
              >
                {new Date(
                  item.created_at
                ).toLocaleString()}
              </Text>
            </View>
          </View>
        )
      )}
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      marginTop: 16,
    },

    timelineItem: {
      flexDirection: 'row',
      marginBottom: 20,
    },

    leftSection: {
      alignItems: 'center',
      width: 30,
    },

    dot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor:
        '#007AFF',
    },

    line: {
      width: 2,
      flex: 1,
      backgroundColor:
        '#ccc',
      marginTop: 4,
    },

    content: {
      flex: 1,
      paddingLeft: 10,
    },

    status: {
      fontWeight: 'bold',
      fontSize: 15,
    },

    date: {
      color: '#666',
      marginTop: 4,
      fontSize: 12,
    },
  });