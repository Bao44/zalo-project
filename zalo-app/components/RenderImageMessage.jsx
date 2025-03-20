import { StyleSheet, Text, View, Image, FlatList } from "react-native";
import React from "react";

const RenderImageMessage = ({ images, wh }) => {

    const fullWidth = wh;
    const halfWidth = (wh - 3 * 3) / 2;
    const thirdWidth = (wh - 3 * 4) / 3;

    const groubImage = (imgs) => {
        let group = [];
        if (imgs.length === 1) {
            group.push([imgs[0]]);
        } else if (imgs.length === 2) {
            group.push([imgs[0], imgs[1]]);
        } else if (imgs.length === 3) {
            group.push([imgs[0], imgs[1]], [imgs[2]]);
        } else if (imgs.length === 4) {
            group.push([imgs[0], imgs[1]], [imgs[2], imgs[3]]);
        } else if (imgs.length === 5) {
            group.push([imgs[0], imgs[1], imgs[2]], [imgs[3], imgs[4]]);
        } else {
            for (let i = 0; i < imgs.length; i += 3) {
                group.push(imgs.slice(i, i + 3));
            }
        }
        // console.log("Group", group);
        return group;
    };

    const imgG = groubImage(images);

    return (
        <View style={{ width: wh }}>
            <FlatList
                data={imgG}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        {item.map((img, index) => (
                            <Image
                                key={index}
                                source={{ uri: img }}
                                style={[
                                    styles.image,
                                    {
                                        width:
                                            item.length === 1 ? fullWidth :
                                                item.length === 2 ? halfWidth :
                                                    thirdWidth,
                                        height:
                                            item.length === 1 ? fullWidth :
                                                item.length === 2 ? halfWidth :
                                                    thirdWidth,
                                    },
                                ]}
                            />
                        ))}
                    </View>
                )}
            />
        </View>
    );
};

export default RenderImageMessage;

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5,
    },
    image: {
        borderRadius: 8,
    },
});
