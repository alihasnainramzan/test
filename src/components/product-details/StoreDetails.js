import { useTheme } from "@emotion/react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import {
	alpha,
	Grid,
	Paper,
	Tooltip,
	Typography,
	useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/system";
import { useAddStoreToWishlist } from "api-manage/hooks/react-query/wish-list/useAddStoreToWishLists";
import { useWishListStoreDelete } from "api-manage/hooks/react-query/wish-list/useWishListStoreDelete";
import { getAmountWithSign } from "helper-functions/CardHelpers";
import { getModuleId } from "helper-functions/getModuleId";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { addWishListStore, removeWishListStore } from "redux/slices/wishList";
import { CustomButtonPrimary } from "styled-components/CustomButtons.style";
import {
	CustomBoxFullWidth,
	CustomStackFullWidth,
} from "styled-components/CustomStyles.style";
import { not_logged_in_message } from "utils/toasterMessages";
import CustomImageContainer from "../CustomImageContainer";
import CustomRatings from "../search/CustomRatings";
import { RoundedIconButton } from "./product-details-section/ProductsThumbnailsSettings";

const CustomWrapper = styled(Paper)(({ theme }) => ({
	padding: "20px",
	borderRadius: "5px",
	background: theme.palette.background.paper,
	boxShadow:
		"0px 10px 20px -3px rgba(145, 158, 171, 0.05), 0px 0px 2px 0px rgba(145, 158, 171, 0.20)",
}));

const StoreDetails = ({ storeDetails, storeImageBaseUrl }) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const router = useRouter();
	const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
	const { configData } = useSelector((state) => state.configData);
	const dispatchRedux = useDispatch();
	const { wishLists } = useSelector((state) => state.wishList);
	const { mutate } = useWishListStoreDelete();
	const { mutate: addFavoriteMutation } = useAddStoreToWishlist();

	let token = undefined;
	if (typeof window !== "undefined") {
		token = localStorage.getItem("token");
	}
	const onSuccessHandlerForDelete = (res) => {
		dispatchRedux(removeWishListStore(storeDetails?.id));
		toast.success(res.message, {
			id: "wishlist",
		});
	};

	const addToFavorite = () => {
		if (token) {
			addFavoriteMutation(storeDetails?.id, {
				onSuccess: (response) => {
					if (response) {
						dispatchRedux(addWishListStore(storeDetails));
						toast.success(response?.message);
					}
				},
				onError: (error) => {
					toast.error(error.response.data.message);
				},
			});
		} else toast.error(t(not_logged_in_message));
	};
	const isInWishList = (id) => {
		return !!wishLists?.store?.find(
			(wishStore) => wishStore.id === storeDetails?.id
		);
	};
	const deleteWishlistStore = (id) => {
		mutate(id, {
			onSuccess: onSuccessHandlerForDelete,
			onError: (error) => {
				toast.error(error.response.data.message);
			},
		});
	};
	const delievryTime = storeDetails?.delivery_time?.split(" ");
	const handleClick = () => {
		router.push({
			pathname: "/profile",
			query: {
				page: "inbox",
				type: "vendor",
				id: storeDetails?.vendor_id,
				routeName: "vendor_id",
				chatFrom: "true",
			},
		});
	};
	return (
		<CustomWrapper>
			<Grid container spacing={2.5}>
				<Grid item xs={12} container>
					<Grid item xs={10} alignSelf="center">
						<CustomStackFullWidth
							direction="raw"
							alignItems="center"
							sx={{
								flex: "0 0 60px",
								gap: "10px",
							}}
						>
							<CustomBoxFullWidth
								sx={{
									position: "relative",
									height: "60px",
									width: "80px",
									borderRadius: "50%",
									border: (theme) =>
										`1px solid ${alpha(
											theme.palette.neutral[300],
											0.3
										)}`,
								}}
							>
								<CustomImageContainer
									src={storeDetails?.logo_full_url}
									// alt={item?.name}
									height="100%"
									width="100%"
									obejctfit="contain"
									borderRadius="50%"
								/>
							</CustomBoxFullWidth>
							<CustomStackFullWidth spacing={0.5}>
								<Typography variant="h7" component="h2">
									{storeDetails?.name}
								</Typography>
								<CustomStackFullWidth
									direction="row"
									alignItems="center"
								>
									<CustomRatings
										ratingValue={storeDetails?.avg_rating}
										color={theme.palette.warning.main}
										readOnly
									/>
									<Typography
										fontSize="12px"
										color="customColor.textGray"
									>
										({storeDetails?.rating_count})
									</Typography>
								</CustomStackFullWidth>
								<Typography fontSize="14px" component="h3">
									{storeDetails?.total_items - 1}+ {t("Products")}
								</Typography>
							</CustomStackFullWidth>
						</CustomStackFullWidth>
					</Grid>
					<Grid item xs={2}>
						{!isInWishList(storeDetails?.id) && (
							<Tooltip text="Add to cart">
								<RoundedIconButton
									sx={{
										filter:
											"drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.05))",
									}}
									onClick={addToFavorite}
								>
									<FavoriteBorderIcon color="primary" size="small" />
								</RoundedIconButton>
							</Tooltip>
						)}
						{isInWishList(storeDetails?.id) && (
							<Tooltip text="Add to cart">
								<RoundedIconButton
									onClick={() => deleteWishlistStore(storeDetails?.id)}
									sx={{
										filter:
											"drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.05))",
									}}
								>
									<FavoriteIcon color="primary" size="small" />
								</RoundedIconButton>
							</Tooltip>
						)}
					</Grid>
				</Grid>
				<Grid item xs={12} container>
					<Grid item xs={4}>
						<CustomStackFullWidth alignItems="flex-start">
							<Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>
								{storeDetails?.positive_rating.toFixed(1)}%
							</Typography>
							<Typography
								sx={{
									color: (theme) => theme.palette.customColor.textGray,
									fontSize: isSmall ? "12px" : "inherit",
								}}
							>
								{t("Positive Review")}
							</Typography>
						</CustomStackFullWidth>
					</Grid>
					<Grid item xs={4}>
						<CustomStackFullWidth alignItems="flex-start">
							<Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>
								{getAmountWithSign(storeDetails?.minimum_order)}
							</Typography>
							<Typography
								sx={{
									color: (theme) => theme.palette.customColor.textGray,
									fontSize: isSmall ? "12px" : "inherit",
								}}
							>
								{t("Minimum Order")}
							</Typography>
						</CustomStackFullWidth>
					</Grid>
					<Grid item xs={4}>
						<CustomStackFullWidth alignItems="flex-start">
							<CustomStackFullWidth direction="raw" alignItems="center">
								<Typography
									sx={{ fontSize: "18px", fontWeight: "bold" }}
								>
									{delievryTime?.[0]}
								</Typography>
								<Typography sx={{ fontSize: "18px" }}>
									{delievryTime?.[1]}
								</Typography>
							</CustomStackFullWidth>
							<Typography
								sx={{
									color: (theme) => theme.palette.customColor.textGray,
									fontSize: isSmall ? "12px" : "inherit",
								}}
							>
								{t("Delivery Time")}
							</Typography>
						</CustomStackFullWidth>
					</Grid>
				</Grid>
				<Grid item xs={12} container spacing={2}>
					<Grid item xs={12}>
						<Link
							href={{
								pathname: "/store/[id]",
								query: {
									id: `${storeDetails?.id}`,
									module_id: `${getModuleId()}`,
								},
							}}
						>
							<CustomButtonPrimary fullwidth="true">
								<Typography>{t("Visit Store")}</Typography>
							</CustomButtonPrimary>
						</Link>
					</Grid>
				</Grid>
			</Grid>
		</CustomWrapper>
	);
};

StoreDetails.propTypes = {};

export default React.memo(StoreDetails);
