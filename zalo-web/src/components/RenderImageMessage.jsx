import PropTypes from "prop-types";
import { Box, Grid } from "@mui/material";

const RenderImageMessage = ({ images, wh }) => {
    const fullWidth = wh;
    const halfWidth = (wh - 3 * 3) / 2; // Khoảng cách 3px giữa 2 ảnh
    const thirdWidth = (wh - 4 * 3) / 3; // Khoảng cách 3px giữa 3 ảnh

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
        return group;
    };

    const imgG = groubImage(images);

    return (
        <Box sx={{ width: wh }}>
            {imgG.map((group, groupIndex) => (
                <Grid
                    container
                    key={groupIndex}
                    spacing={1} // Khoảng cách 8px (default MUI spacing unit)
                    sx={{ marginBottom: "5px" }}
                >
                    {group.map((img, imgIndex) => (
                        <Grid
                            item
                            key={imgIndex}
                            xs={group.length === 1 ? 12 : group.length === 2 ? 6 : 4} // Chia cột: 1 ảnh = 12, 2 ảnh = 6 mỗi, 3 ảnh = 4 mỗi
                        >
                            <Box
                                component="img"
                                src={img}
                                alt={`image-${groupIndex}-${imgIndex}`}
                                sx={{
                                    width:
                                        group.length === 1
                                            ? fullWidth
                                            : group.length === 2
                                                ? halfWidth
                                                : thirdWidth,
                                    height:
                                        group.length === 1
                                            ? fullWidth
                                            : group.length === 2
                                                ? halfWidth
                                                : thirdWidth,
                                    borderRadius: "8px",
                                    objectFit: "cover",
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            ))}
        </Box>
    );
};
RenderImageMessage.propTypes = {
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    wh: PropTypes.number.isRequired,
};

export default RenderImageMessage;