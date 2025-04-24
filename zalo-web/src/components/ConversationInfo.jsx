import { useState, useRef } from 'react';
import { Modal, Box, Typography, IconButton, List, ListItem, ListItemText, Switch, Button, Tabs, Tab, MenuItem, Select, FormControl, InputLabel, TextField, Autocomplete } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ReportIcon from '@mui/icons-material/Report';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { subDays, subMonths } from 'date-fns';
import vi from 'date-fns/locale/vi'; // Locale tiếng Việt
import NotificationsIcon from '@mui/icons-material/Notifications';
import PushPinIcon from '@mui/icons-material/PushPin';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

const ConversationInfo = () => {
  const [open, setOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveTab, setArchiveTab] = useState('media'); // Tab mặc định là Ảnh/Video
  const [fileTypeFilter, setFileTypeFilter] = useState(''); // Dropdown Loại (File)
  const [sourceFilter, setSourceFilter] = useState(null); // Dropdown Người gửi
  const [dateFilter, setDateFilter] = useState({ from: null, to: null, preset: '' }); // Quản lý khoảng thời gian
  const [searchQuery, setSearchQuery] = useState(''); // Thanh tìm kiếm file
  const [isDatePickerFocused, setIsDatePickerFocused] = useState(false); // Trạng thái để kiểm soát đóng dropdown
  const datePickerRef = useRef(null); // Ref để tham chiếu DatePicker

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleArchiveOpen = (tab) => {
    setArchiveTab(tab);
    setArchiveOpen(true);
  };
  const handleArchiveClose = () => setArchiveOpen(false);

  const handlePresetSelect = (preset) => {
    let fromDate = new Date();
    switch (preset) {
      case '7 ngày trước':
        fromDate = subDays(fromDate, 7);
        break;
      case '30 ngày trước':
        fromDate = subDays(fromDate, 30);
        break;
      case '3 tháng trước':
        fromDate = subMonths(fromDate, 3);
        break;
      default:
        fromDate = null;
    }
    setDateFilter({ from: fromDate, to: new Date(), preset });
  };

  // Ngăn dropdown đóng khi DatePicker đang được tương tác
  const handleDatePickerFocus = () => {
    setIsDatePickerFocused(true);
  };

  const handleDatePickerBlur = () => {
    setTimeout(() => {
      setIsDatePickerFocused(false);
    }, 200); // Delay để đảm bảo không đóng ngay lập tức
  };

  const modalStyle = {
    position: 'absolute',
    top: 0,              // Stick to the top
    right: 0,            // Stick to the right
    bottom: 0,           // Stick to the bottom
    transform: 'none',   // Remove the centering transform
    width: 400,
    bgcolor: 'background.paper',
    border: '1px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    overflowY: 'auto',
  };

  const archiveModalStyle = {
    position: 'absolute',
    top: 0,              // Stick to the top
    right: 0,            // Stick to the right
    bottom: 0,           // Stick to the bottom
    transform: 'none',   // Remove the centering transform
    width: 400,
    bgcolor: 'background.paper',
    border: '1px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    overflowY: 'auto',
  };

  // Danh sách người gửi
  const senders = [
    { label: 'Ethicsnguyen Dtrong', avatar: 'https://picsum.photos/30' },
    { label: 'Duc tai', avatar: 'https://picsum.photos/30' },
    { label: 'Duc tai', avatar: 'https://picsum.photos/30' },
    { label: 'Duc tai', avatar: 'https://picsum.photos/30' },
    { label: 'Duc tai', avatar: 'https://picsum.photos/30' },
    { label: 'Duc tai', avatar: 'https://picsum.photos/30' },
    { label: 'Duc tai', avatar: 'https://picsum.photos/30' },
  ];

  // Header Box (Thông tin hội thoại, Avatar, Tên, Tùy chọn)
  const HeaderBox = () => (
    <Box>
      <Typography variant="h6">Thông tin hội thoại</Typography>
      <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
        <img
          src="https://picsum.photos/200/300"
          alt="Avatar"
          style={{ borderRadius: '50%', width: 40, height: 40, marginRight: 10 }}
        />
        <Typography variant="subtitle1">Duc tai</Typography>
        <IconButton size="small" sx={{ ml: 1 }}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box display="flex" justifyContent="center" mt={2}>
        <IconButton>
          <NotificationsIcon />
        </IconButton>
        <Typography variant="body2" sx={{ mt: 1 }}>Tất cả</Typography>
        <IconButton>
          <PushPinIcon />
        </IconButton>
        <Typography variant="body2" sx={{ mt: 1 }}>Ghim hội thoại</Typography>
        <IconButton>
          <GroupAddIcon />
        </IconButton>
        <Typography variant="body2" sx={{ mt: 1 }}>Tạo nhóm trò chuyện</Typography>
      </Box>
    </Box>
);

  // Reminder Box (Danh sách nhạc hẹn)
  const ReminderBox = () => (
    <Box>
      <List>
        <ListItem button>
          <AccessTimeIcon sx={{ mr: 1 }} />
          <ListItemText primary="Danh sách nhạc hẹn" />
        </ListItem>
        <ListItem>
          <GroupIcon sx={{ mr: 1 }} />
          <ListItemText primary="1 nhóm chung" />
        </ListItem>
      </List>
    </Box>
  );

  // Media Box (Ảnh/Video)
  const MediaBox = () => (
    <Box mt={2}>
      <Typography variant="subtitle1">Ảnh/Video</Typography>
      <Box display="flex" gap={1} mt={1}>
        <img src="https://picsum.photos/200/300" alt="media" />
        <img src="https://picsum.photos/200/300" alt="media" />
      </Box>
      <Box mt={1}>
        <Button
          variant="text"
          size="small"
          sx={{ color: 'blue', textTransform: 'none' }}
          onClick={() => handleArchiveOpen('media')}
        >
          Xem tất cả
        </Button>
      </Box>
    </Box>
  );

  // File Box (File)
  const FileBox = () => (
    <Box mt={2}>
      <Typography variant="subtitle1">File</Typography>
      <List>
        <ListItem>
          <InsertDriveFileIcon sx={{ mr: 1 }} />
          <ListItemText primary="zalo-project-main.zip" secondary="8.47 MB • Hôm nay" />
          <CheckCircleIcon sx={{ color: 'green' }} />
        </ListItem>
        <ListItem>
          <InsertDriveFileIcon sx={{ mr: 1 }} />
          <ListItemText primary="B3-4.rar" secondary="20.24 MB • 15/04/2025" />
          <CheckCircleIcon sx={{ color: 'green' }} />
        </ListItem>
        <ListItem>
          <InsertDriveFileIcon sx={{ mr: 1 }} />
          <ListItemText primary="N1-PLDC-Review.docx" secondary="16.17 KB • 10/09/2024" />
          <CheckCircleIcon sx={{ color: 'green' }} />
        </ListItem>
        <ListItem>
          <Button
            variant="text"
            size="small"
            sx={{ color: 'blue', textTransform: 'none' }}
            onClick={() => handleArchiveOpen('files')}
          >
            Xem tất cả
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  // Link Box (Link)
  const LinkBox = () => (
    <Box mt={2}>
      <Typography variant="subtitle1">Link</Typography>
      <List>
        <ListItem>
          <LinkIcon sx={{ mr: 1 }} />
          <ListItemText primary="github.com" secondary="Hôm nay" />
        </ListItem>
        <ListItem>
          <LinkIcon sx={{ mr: 1 }} />
          <ListItemText primary="GOOGLE MEET - ONLINE VIDEO CALL" secondary="15/04" />
        </ListItem>
        <ListItem>
          <LinkIcon sx={{ mr: 1 }} />
          <ListItemText primary="HOME - CFx.re Docs" secondary="25/02" />
        </ListItem>
        <ListItem>
          <Button
            variant="text"
            size="small"
            sx={{ color: 'blue', textTransform: 'none' }}
            onClick={() => handleArchiveOpen('links')}
          >
            Xem tất cả
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  // Security Box (Thiết lập bảo mật)
  const SecurityBox = () => (
    <Box mt={2}>
      <Typography variant="subtitle1">Thiết lập bảo mật</Typography>
      <List>
        <ListItem>
          <AccessTimeIcon sx={{ mr: 1 }} />
          <ListItemText primary="Tin nhắn tự xóa" secondary="Không bao giờ" />
          <Switch />
        </ListItem>
        <ListItem>
          <VisibilityOffIcon sx={{ mr: 1 }} />
          <ListItemText primary="Ẩn trò chuyện" />
          <Switch />
        </ListItem>
      </List>
    </Box>
  );

  // Report Box (Báo xấu)
  const ReportBox = () => (
    <Box mt={2}>
      <List>
        <ListItem button sx={{ color: 'red' }}>
          <ReportIcon sx={{ mr: 1 }} />
          <ListItemText primary="Báo xấu" />
        </ListItem>
        <ListItem button sx={{ color: 'red' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          <ListItemText primary="Xóa lịch sử trò chuyện" />
        </ListItem>
      </List>
    </Box>
  );

  // Archive Modal (Kho lưu trữ)
  const ArchiveModal = () => {
    // Dữ liệu mẫu cho Ảnh/Video
    const mediaData = [
      { date: 'Ngày 27 Tháng 1', items: ['https://picsum.photos/200/300'] },
      { date: 'Ngày 26 Tháng 9 Năm 2024', items: ['https://picsum.photos/200/300', 'https://picsum.photos/200/300', 'https://picsum.photos/200/300'] },
      { date: 'Ngày 17 Tháng 9 Năm 2024', items: ['https://picsum.photos/200/300'] },
      { date: 'Ngày 14 Tháng 9 Năm 2024', items: ['https://picsum.photos/200/300', 'https://picsum.photos/200/300'] },
      { date: 'Ngày 08 Tháng 9 Năm 2024', items: ['https://picsum.photos/200/300', 'https://picsum.photos/200/300'] },
    ];

    // Dữ liệu mẫu cho File
    const fileData = [
      { date: 'Ngày 23 Tháng 4', items: [{ name: 'zalo-project-main.zip', size: '8.47 MB', status: 'Đã có trên máy' }] },
      { date: 'Ngày 15 Tháng 4', items: [{ name: 'B3-4.rar', size: '20.24 MB', status: 'Đã có trên máy' }] },
      {
        date: 'Ngày 10 Tháng 9 Năm 2024',
        items: [
          { name: 'N1-PLDC-Review.docx', size: '16.17 KB', status: 'Đã có trên máy' },
          { name: 'câu hỏi luật hiện pháp.docx', size: '12.48 KB', status: 'Đã có trên máy' },
        ],
      },
      {
        date: 'Ngày 08 Tháng 9 Năm 2024',
        items: [
          { name: 'taippx.pptx', size: '87.59 MB', status: 'Đã có trên máy' },
          { name: 'Hình ảnh (Hiện pháp).docx', size: '2.41 MB', status: 'Đã có trên máy' },
          { name: 'N1-HienPhap.docx', size: '39.68 KB', status: 'Đã có trên máy' },
        ],
      },
      {
        date: 'Ngày 26 Tháng 7 Năm 2024',
        items: [
          { name: 'data.zip', size: '344.08 MB', status: 'File không có trên máy' },
          { name: 'gray.rar', size: '', status: '' },
        ],
      },
    ];

    // Dữ liệu mẫu cho Link
    const linkData = [
      { date: 'Hôm nay', items: ['github.com'] },
      { date: '15/04', items: ['GOOGLE MEET - ONLINE VIDEO CALL'] },
      { date: '25/02', items: ['HOME - CFx.re Docs'] },
    ];

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
        <Modal open={archiveOpen} onClose={handleArchiveClose}>
          <Box sx={archiveModalStyle}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Kho lưu trữ</Typography>
              <Box>
                <Button
                  variant="text"
                  size="small"
                  sx={{ color: 'blue', textTransform: 'none', mr: 1 }}
                  onClick={() => alert('Chọn')}
                >
                  Chọn
                </Button>
                <IconButton onClick={handleArchiveClose}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Tabs */}
            <Tabs
              value={archiveTab}
              onChange={(e, newValue) => setArchiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Ảnh/Video" value="media" />
              <Tab label="Files" value="files" />
              <Tab label="Links" value="links" />
            </Tabs>

            {/* Thanh tìm kiếm và Dropdowns */}
            <Box mt={2}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm kiếm File"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} />,
                }}
              />

              <Box display="flex" gap={1} mt={2}>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Loại</InputLabel>
                  <Select
                    value={fileTypeFilter}
                    label="Loại"
                    onChange={(e) => setFileTypeFilter(e.target.value)}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="PDF">PDF</MenuItem>
                    <MenuItem value="Word">Word</MenuItem>
                    <MenuItem value="PowerPoint">PowerPoint</MenuItem>
                    <MenuItem value="Excel">Excel</MenuItem>
                  </Select>
                </FormControl>

                <Autocomplete
                  size="small"
                  options={senders}
                  getOptionLabel={(option) => option.label}
                  value={sourceFilter}
                  onChange={(event, newValue) => setSourceFilter(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Người gửi"
                      placeholder="Tìm kiếm"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <SearchIcon sx={{ mr: 1, color: 'gray' }} />
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} display="flex" alignItems="center">
                      <img
                        src={option.avatar}
                        alt={option.label}
                        style={{ width: 30, height: 30, borderRadius: '50%', marginRight: 8 }}
                      />
                      {option.label}
                    </Box>
                  )}
                  sx={{ minWidth: 100 }}
                />

                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Ngày gửi</InputLabel>
                  <Select
                    value={dateFilter.preset || 'custom'}
                    label="Ngày gửi"
                    onChange={(e) => {
                      if (e.target.value !== 'custom') {
                        handlePresetSelect(e.target.value);
                      }
                    }}
                    MenuProps={{
                      disableAutoFocusItem: true,
                      onClose: () => {
                        // Chỉ đóng dropdown khi không tương tác với DatePicker
                        if (!isDatePickerFocused) {
                          return;
                        }
                      },
                    }}
                  >
                    <MenuItem value="header1" disabled>
                      <Typography variant="subtitle2">Gợi ý thời gian</Typography>
                    </MenuItem>
                    <MenuItem value="7 ngày trước">7 ngày trước</MenuItem>
                    <MenuItem value="30 ngày trước">30 ngày trước</MenuItem>
                    <MenuItem value="3 tháng trước">3 tháng trước</MenuItem>
                    <MenuItem value="header2" disabled>
                      <Typography variant="subtitle2">Chọn khoảng thời gian</Typography>
                    </MenuItem>
                    <MenuItem value="custom">
                      <Box display="flex" gap={1} width="100%" ref={datePickerRef}>
                        <DatePicker
                          label="Từ ngày"
                          value={dateFilter.from}
                          onChange={(newValue) => setDateFilter((prev) => ({ ...prev, from: newValue, preset: '' }))}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              onFocus={handleDatePickerFocus}
                              onBlur={handleDatePickerBlur}
                            />
                          )}
                          views={['year', 'month', 'day']}
                          inputFormat="dd/MM/yyyy"
                          disableFuture
                          sx={{ flex: 1 }}
                        />
                        <DatePicker
                          label="Đến ngày"
                          value={dateFilter.to}
                          onChange={(newValue) => setDateFilter((prev) => ({ ...prev, to: newValue, preset: '' }))}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              onFocus={handleDatePickerFocus}
                              onBlur={handleDatePickerBlur}
                            />
                          )}
                          views={['year', 'month', 'day']}
                          inputFormat="dd/MM/yyyy"
                          disableFuture
                          minDate={dateFilter.from || undefined}
                          sx={{ flex: 1 }}
                        />
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Nội dung kho lưu trữ */}
            {archiveTab === 'media' && (
              <Box mt={2}>
                {mediaData.map((group, index) => (
                  <Box key={index} mb={2}>
                    <Typography variant="subtitle2">{group.date}</Typography>
                    <Box display="flex" gap={1} mt={1}>
                      {group.items.map((item, idx) => (
                        <img key={idx} src={item} alt="media" style={{ width: 50, height: 50 }} />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {archiveTab === 'files' && (
              <Box mt={2}>
                {fileData.map((group, index) => (
                  <Box key={index} mb={2}>
                    <Typography variant="subtitle2">{group.date}</Typography>
                    <List>
                      {group.items.map((file, idx) => (
                        <ListItem key={idx}>
                          <InsertDriveFileIcon sx={{ mr: 1 }} />
                          <ListItemText primary={file.name} secondary={`${file.size} • ${file.status}`} />
                          <CheckCircleIcon sx={{ color: 'green' }} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))}
              </Box>
            )}

            {archiveTab === 'links' && (
              <Box mt={2}>
                {linkData.map((group, index) => (
                  <Box key={index} mb={2}>
                    <Typography variant="subtitle2">{group.date}</Typography>
                    <List>
                      {group.items.map((link, idx) => (
                        <ListItem key={idx}>
                          <ListItemText primary={link} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Modal>
      </LocalizationProvider>
    );
  };

  return (
    <div>
      <IconButton onClick={handleOpen}>
        <InfoIcon />
      </IconButton>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <HeaderBox />
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <ReminderBox />
          <MediaBox />
          <FileBox />
          <LinkBox />
          <SecurityBox />
          <ReportBox />
        </Box>
      </Modal>

      <ArchiveModal />
    </div>
  );
};

export default ConversationInfo;