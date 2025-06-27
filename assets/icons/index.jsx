import { useTheme } from "../../contexts/ThemeContext";
import Add from "./Add";
import Album from "./Album";
import ArrowLeft from "./ArrowLeft";
import Cake from "./Cake";
import Camera from "./Camera";
import Close from "./Close";
import Comment from "./Comment";
import Edit from "./Edit";
import Heart from "./Heart";
import Home from "./Home";
import Logo from "./Logo";
import MoreHorizontal from "./MoreHorizontal";
import Phone from "./Phone";
import Satelita from "./Satelita";
import Search from "./Search";
import SendMessage from "./SendMessage";
import SettingsIcon from "./SettingsIcon";
import Share from "./Share";
import User from "./User";
import Video from "./Video";

const icons = {
  home: Home,
  logo: Logo,
  user: User,
  heart: Heart,
  search: Search,
  add: Add,
  arrowLeft: ArrowLeft,
  camera: Camera,
  sendMessage: SendMessage,
  phone: Phone,
  cake: Cake,
  album: Album,
  video: Video,
  close: Close,
  moreHorizontal: MoreHorizontal,
  comment: Comment,
  share: Share,
  satelita: Satelita,
  edit: Edit,
  settings: SettingsIcon,
};

const Icon = ({ name, ...props }) => {
  const { theme } = useTheme();
  const IconComponent = icons[name];
  return (
    <IconComponent
      height={props.size || 24}
      width={props.size || 24}
      strokeWidth={props.strokeWidth || 1.5}
      colors={theme.colors.text}
      {...props}
    />
  );
};

export default Icon;
