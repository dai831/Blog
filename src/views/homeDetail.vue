<template>
	<div class="homeDetail">
		<el-row>
			<el-col :span="6"></el-col>
			<el-col :span="12">
				<div class="homeDetail_center">
					<el-row :gutter="20" class="main">
						<el-col :span="6" v-for="(item) in titleData" :key="item.url">
							<div class="homeDetail_item">
								<div class="homeDetail_img">
									<div v-viewer> 
										<img v-lazy="item.url" :key="item.url" :alt="item.category"/>
									</div>
									<!-- <viewer :images="images"> 这种方式也可以
										<img :src="item.url" v-lazy="item.url" :key="item.url" :alt="item.category"/>
									</viewer> -->
									<!-- <div class="overlay"></div> -->
								</div>
								<div class="homeDetail_text">
									<div class="text1 text_overflow">{{ item.category }}</div>
									<div class="text2 text_overflow">{{ item.tag }}</div>
								</div>
							</div>
						</el-col>
					</el-row>
					<Pagination 
						@onSizeChange="onSizeChange"
						@onCurrentChange="onCurrentChange"
						:page="page">
					</Pagination>
				</div>
			</el-col>
			<el-col :span="6"></el-col>
		</el-row>
	</div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { categoryApi } from "@/api/homeDetail"; 
import Pagination from '../components/Pagination.vue';
import { useRoute } from "vue-router";
import { useUserStore } from "@/store/user";
const User = useUserStore();
const route = useRoute();

const titleData = ref([]);
const page = reactive({
	pageno: 1,
	count: 20,
	total: 0
})

onMounted( async() =>{
	User.userInfo.routeKey = null;
	categoryList(route.query.cids);
})

const categoryList = async (cids) =>{
	let params = {
		pageno: page.pageno,
		count: page.count,
		cids: cids
	}
	const res = await categoryApi(params);
	titleData.value = res?.data?.data?.list || [];
	page.total = res?.data?.data?.total_count || 0;
}

const onSizeChange = (val) => {
	page.count = val;
	categoryList(route.query.cids);
}
const onCurrentChange = (val) => {
	page.pageno = val;
	categoryList(route.query.cids);
}

</script>
<style lang="scss" scoped>
.homeDetail{
	background-color: #f2f3f5;
}
.homeDetail_center{
	height: 94vh;
	box-sizing: border-box;
}
.main{
	height: calc(94vh - 4rem);
	overflow: auto;
}
.homeDetail_item{
	margin-top: 20px;
	box-sizing: border-box;
	transition: all 0.3s ease;
	.homeDetail_text{
		padding: 2% 4%;
		background-color: #fff;
		font-family: 'KAITI';
		border-bottom-left-radius: 8px;
		border-bottom-right-radius: 8px;
	}
	.text1{
		padding-bottom: 2%;
		font-weight: bolder;
	}
	.homeDetail_img{
		position: relative;
		overflow: hidden;
		border-top-left-radius: 8px;
		border-top-right-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		img{
			display: block; //如果是行内快存在自带3px的下边距
			transition: all 0.5s ease;
			border: none;
  			background: none;
		}
		// &:hover > img{
		// 	transform: scale(1.3);
		// }	
		// .overlay{
		// 	position: absolute;
		// 	top: 0;
		// 	left: 0;
		// 	width: 100%;
		// 	height: 100%;
		// 	background-color: rgba(0, 0, 0, 0.5); /* 蒙层的颜色和透明度 */
		// 	opacity: 0;
		// 	transition: opacity 0.3s ease;
		// }
		// &:hover .overlay{
		// 	opacity: 0.5;
		// }	
	}
	// &:hover{
	// 	border-radius: 8px;
	// }
}
</style>