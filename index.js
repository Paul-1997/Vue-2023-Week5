const { createApp } = Vue;
const base = 'https://vue3-course-api.hexschool.io';

const productModal = {
	props: ['product'],
	data() {
		return {
			modal: null,
			qty: 1,
		};
	},
	methods: {
		openModal() {
			this.modal.show();
		},
		closeModal() {
			this.modal.hide();
		},
	},
	mounted() {
		this.modal = new bootstrap.Modal(this.$refs.productModal, {
			keyboard: false,
			backdrop: 'static',
		});
	},
	template: `<div class="modal fade" id="productModal" tabindex="-1" role="dialog"
    aria-labelledby="exampleModalLabel" aria-hidden="true" ref="productModal">
     <div class="modal-dialog modal-xl" role="document">
       <div class="modal-content border-0">
         <div class="modal-header bg-dark text-white">
           <h5 class="modal-title" id="exampleModalLabel">
             <span>{{ product.title }}</span>
           </h5>
           <button type="button" class="btn-close btn-close-white"
                  aria-label="Close" @click='closeModal'></button>
         </div>
         <div class="modal-body">
           <div class="row">
             <div class="col-sm-6">
               <img class="img-fluid" :src="product.imageUrl" alt="">
             </div>
             <div class="col-sm-6">
               <span class="badge bg-primary rounded-pill">{{ product.category }}</span>
               <div class="d-flex flex-column" style="height:calc(100% - 30px)">
                
                <div class="flex-grow-1">
                    <p>商品描述：{{ product.description }}</p>
                    <p>商品內容：{{ product.content }}</p>
                    <div class="h5" v-if="!product.price">{{ product.origin_price }} 元</div>
                    <del class="h6" v-if="product.price">原價 {{ product.origin_price }} 元</del>
                    <div class="h5" v-if="product.price">現在只要 {{ product.price }} 元</div>
                </div>
                <div class="input-group  mt-auto align-items-center">
                   <label for="productQty" class="me-1 fs-5">選擇數量 :</label>
                   <input type="number" id="productQty" class="form-control"
                         v-model.number="qty" min="1" placeholder="請輸入要訂購的數量(預設為1)">
                   <button type="button" class="btn btn-primary"
                           @click="$emit('emit-add-to-cart', product.id, qty)">加入購物車</button>
                 </div>
               </div>
               </div>
             </div>
           </div>
         </div>
       </div>
   </div>`,
};
// 補個toast狀態訊息回饋
// 表單

const app = createApp({
	data() {
		return {
			modalProduct: {},
			products: [],
			cart: {
				carts: [],
			},
			formData: {
				userName: '',
				userEmail: '',
				userTel: '',
				userAddress: '',
				userMsg: '',
			},
			// statement
			onLoadingTargetId: '',
            onLoading : false,
		};
	},
	methods: {
		async getProducts() {
            this.onLoading = true;
			try {
				const product = await axios.get(
					`${base}/v2/api/paul7426/products`
				);
				if (product.data.success) {
					this.products = product.data.products;
                    this.onLoading = false;
				}
			} catch (err) {
				if(this.onLoading)this.onLoading = false;
				this.onLoadingTargetId = '';
				const msg = err?.response?.data?.message ?? '出錯了٩(ŏ﹏ŏ、)۶';
				showErrorMsg(msg)
			}
		},
		async getProduct(id) {
			this.onLoadingTargetId = id;
			try {
				const product = await axios.get(
					`${base}/v2/api/paul7426/product/${id}`
				);
				if (product.data.success) {
					this.modalProduct = product.data.product;
					this.$refs.productModal.openModal();
					this.onLoadingTargetId = '';
				}
			} catch (err) {
				console.log(err)
				if(this.onLoading)this.onLoading = false;
				this.onLoadingTargetId = '';
				const msg = err?.response?.data?.message ?? '出錯了٩(ŏ﹏ŏ、)۶';
				showErrorMsg(msg)
			}
		},
		async getCarts() {
			try {
				const CartsData = await axios.get(`${base}/v2/api/paul7426/cart`);
				if (CartsData.data.success) {
					this.cart = CartsData.data.data;
					console.log(this.cart)
				}
			} catch (err) {
				if(this.onLoading)this.onLoading = false;
				this.onLoadingTargetId = '';
				const msg = err?.response?.data?.message ?? '出錯了٩(ŏ﹏ŏ、)۶';
				showErrorMsg(msg)
			}
		},
		async addToCart(productId, qty = 1) {
			const productName = this.products.find(item=>item.id === productId).title;
			const data = {
				data: {
					product_id: productId,
					qty,
				},
			};
			try {
				this.$refs.productModal.closeModal();
				this.onLoadingTargetId = productId;
				const result = await axios.post(`${base}/v2/api/paul7426/cart`, data);
				showStatusMsgToast(`${productName} ${result.data.message}`)
				this.getCarts();
				this.onLoadingTargetId = '';
			} catch (err) {
				if(this.onLoading)this.onLoading = false;
				this.onLoadingTargetId = '';
				const msg = err?.response?.data?.message ?? '出錯了٩(ŏ﹏ŏ、)۶';
				showErrorMsg(msg)
			}
		},
		async updateCart({ id, product_id, qty }) {
			const data = {
				data: {
					product_id,
					qty,
				},
			};
			try {
				this.$refs.productModal.closeModal();
				const result = await axios.put(
					`${base}/v2/api/paul7426/cart/${id}`,
					data
				);
				showStatusMsgToast(result.data.message)
				this.getCarts();
			} catch (err) {
				if(this.onLoading)this.onLoading = false;
				this.onLoadingTargetId = '';
				const msg = err?.response?.data?.message ?? '出錯了٩(ŏ﹏ŏ、)۶';
				showErrorMsg(msg)
			}
		},
		async removeCart(id) {
			try {
				const result = await axios.delete(`${base}/v2/api/paul7426/cart/${id}`);
				if (result.data.success) {
					showStatusMsgToast(`該品項${result.data.message}`)
					this.getCarts();
				}
			} catch (err) {
				if(this.onLoading)this.onLoading = false;
				this.onLoadingTargetId = '';
				const msg = err?.response?.data?.message ?? '出錯了٩(ŏ﹏ŏ、)۶';
				showErrorMsg(msg)
			}
		},
		async removeAllCart() {
			try {
				const result = await axios.delete(`${base}/v2/api/paul7426/carts`);
				if (result.data.success) {
					showStatusMsgToast('購物車已清空(๑•̀ㅂ•́)و✧')
					this.getCarts();
				}
			} catch (err) {
				if(this.onLoading)this.onLoading = false;
				this.onLoadingTargetId = '';
				const msg = err?.response?.data?.message ?? '出錯了٩(ŏ﹏ŏ、)۶';
				showErrorMsg(msg)
			}
		},
		async createOrder() {
			const order = {
				"data": {
				  "user": {
					"name": this.formData.userName,
					"email": this.formData.userEmail,
					"tel": this.formData.userTel,
					"address": this.formData.userAddress,
				  },
				  "message": this.formData.userMsg
				}
			  }
			try{
				this.onLoading = true;
				const result = await axios.post(`${base}/v2/api/paul7426/order`,order);
				if(result.data.success){
					this.onLoading = false;
					Swal.fire({
						icon:'success',
						title:'已送出表單!',
						showConfirmButton: false,
						timer:1000,
					})

					this.getCarts()

				}
			}catch(err){
				if(this.onLoading)this.onLoading = false;
				const msg = err?.response?.data?.message ?? '出錯了٩(ŏ﹏ŏ、)۶';
				showErrorMsg(msg)
			}

		},
		formatNum(num) {
			return num.toLocaleString('zh-Hant', {
				style: 'currency',
				currency: 'NTD',
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			});
		}
	},
	computed: {
		sortProducts() {
			return [...this.products].sort((a, b) => {
				if (a.category === b.category) return a.price - b.price;
				return a.category > b.category ? 1 : -1;
			});
		}
	},
	mounted() {
		this.getProducts();
		this.getCarts();
	},
});

//veeValidate
// 抓規則
Object.keys(VeeValidateRules).forEach(rule => {
	if (rule !== 'default') {
		VeeValidate.defineRule(rule, VeeValidateRules[rule]);
	}
});
// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');
// Activate the locale
VeeValidate.configure({
	generateMessage: VeeValidateI18n.localize('zh_TW'),
	validateOnInput: true,
});

app.component('productModal', productModal);

app.component('loading', VueLoading.Component);

app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('#app');



function showErrorMsg(msg){
	Swal.fire({
		title: 'Error!',
		text: msg,
		icon: 'error',
		confirmButtonText: 'Ok',
	})
}

function showStatusMsgToast(msg,icon='success',delay = 750){
	setTimeout(()=>Swal.fire({
		icon,
		toast: true,
		text:msg,
		timer: 1500,
		showConfirmButton: false,
		position:'bottom-end',
		background: '#eee',
		padding:'.75rem 1rem',
	}),delay)
}

