<template>
  <section class="page-section">
     <b-container>
      <HeaderPage title="Editar perfil"/>
   
      <!--FORM-->
      <b-row>
        <b-col cols="2"></b-col>
        <b-col cols="8">
          <form @submit.prevent="update">
            <div class="form-group">
              <input
                v-model="user.name"
                type="text"
                class="form-control form-control-lg"
                id="txtName"
                placeholder="escreve nome"
                required
              />
            </div>
            <div class="form-group">
            <input
              v-model="user.birth_date"
              type="date"
              onmouseenter="(this.type='date')"
              onmouseleave="(this.type='text')"
              class="form-control form-control-lg"
              id="txtBirthDate"
              placeholder="escreve data de nascimento"
              required
            />
            </div>
            <div class="form-group">
              <textarea
                id="txtDescription"
                class="form-control form-control-lg"
                placeholder="escreve descrição"
                cols="30"
                rows="10"
                v-model="user.description"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <input
                v-model="user.location.city"
                type="text"
                class="form-control form-control-lg"
                id="txtCity"
                placeholder="escreve cidade"
                required
              />
            </div>
            <div class="form-group">
              <input
                v-model="user.location.country"
                type="text"
                class="form-control form-control-lg"
                id="txtCountry"
                placeholder="escreve país"
                required
              />
            </div>
            
            <div class="form-group">
              <input
                v-model="user.auth.password"
                type="password"
                class="form-control form-control-lg"
                id="txtPassword"
                placeholder="escreve password"
                required
              />
            </div>
            <div class="form-group">
              <input
                v-model="user.auth.password"
                type="password"
                class="form-control form-control-lg"
                id="txtConfirmPassword"
                placeholder="confirma password"
              />
            </div>
            <button type="submit" class="btn btn-outline-success btn-lg mr-2">
              <i class="fas fa-edit"></i> ATUALIZAR</button>
            <router-link
              :to="{name: 'profile'}"
              tag="button"
              class="btn btn-outline-danger btn-lg"
            ><i class="fas fa-window-close"></i> CANCELAR</router-link>
          </form>
        </b-col>
        <b-col cols="2"></b-col>
      </b-row>
     </b-container>
  </section>
</template>

<script>
import { EDIT_USER } from "@/store/users/user.constants";
import HeaderPage from "@/components/HeaderPage.vue"
import router from "@/router";
import { STORAGE_USER_PROFILE } from "@/store/constants";
import { mapGetters } from "vuex";

export default {
  name: "EditUser",
  components: {
    HeaderPage
  },
  data: () => {
    return {
      user: {}
    };
  },
  computed: {
    ...mapGetters("auth", ["getProfile"]),
    ...mapGetters("user", ["getMessage"])
  },
  methods: {
    update() {
      this.$store.dispatch(`user/${EDIT_USER}`, this.$data.user).then(
        () => {
          Object.assign(this.getProfile, {
            name: this.user.name,
            birth_date: this.user.birth_date,
            description: this.user.description,
            location: JSON.parse(JSON.stringify(this.user.location))
          });
          try {
            localStorage.setItem(
              STORAGE_USER_PROFILE,
              JSON.stringify(this.getProfile)
            );
          } catch (error) {
            this.$alert(
              "Perfil atualizado, mas não foi possível guardar os dados da sessão neste navegador.",
              "Informação",
              "info"
            );
            router.push({ name: "profile" });
            return;
          }
          this.$alert(
            this.getMessage,
            "Perfil atualizado!",
            "success"
          );
          router.push({name: 'profile'});
        },
        err => {
          this.$alert(`${err.message}`, "Erro", "error");
        }
      );
    }
  },
  created() {
    this.user = JSON.parse(JSON.stringify(this.getProfile));
    this.user.birth_date =
      typeof this.user.birth_date === "string"
        ? this.user.birth_date.slice(0, 10)
        : "";
  }
};
</script>
