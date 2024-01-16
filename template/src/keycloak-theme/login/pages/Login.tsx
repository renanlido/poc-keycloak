import { useState, type FormEventHandler } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { useConstCallback } from "keycloakify/tools/useConstCallback";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

const my_custom_param = new URL(window.location.href).searchParams.get("my_custom_param");

if (my_custom_param !== null) {
  console.log("my_custom_param:", my_custom_param);
}

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

  const { getClassName } = useGetClassName({
    doUseDefaultCss,
    classes
  });

  const { social, realm, url, usernameHidden, login, auth, registrationDisabled } = kcContext;

  const { msg, msgStr } = i18n;

  const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

  const onSubmit = useConstCallback<FormEventHandler<HTMLFormElement>>(e => {
    e.preventDefault();

    setIsLoginButtonDisabled(true);

    const formElement = e.target as HTMLFormElement;

    //NOTE: Even if we login with email Keycloak expect username and password in
    //the POST request.
    formElement.querySelector("input[name='email']")?.setAttribute("name", "username");

    formElement.submit();
  });

  return (
    <div className="login-template">
      <div className="login-template__left-side" />

      <div className="login-template__right-side">
        <Template
          {...{ kcContext, i18n, doUseDefaultCss, classes }}
          displayInfo={social.displayInfo}
          displayWide={realm.password && social.providers !== undefined}
          headerNode={msg("doLogIn")}
          infoNode={
            realm.password &&
            realm.registrationAllowed &&
            !registrationDisabled && (
              <div id="kc-registration">
                <span>
                  {msg("noAccount")}
                  <a tabIndex={6} href={url.registrationUrl}>
                    {msg("doRegister")}
                  </a>
                </span>
              </div>
            )
          }
        >

          {/* <pre>{JSON.stringify({kcContext,i18n, doUseDefaultCss, classes}, null, 2)}</pre> */}


          <div id="kc-form" className={clsx(realm.password && social.providers !== undefined && getClassName("kcContentWrapperClass"))}>
            <div
              id="kc-form-wrapper"
              className={clsx(
                realm.password &&
                social.providers && [getClassName("kcFormSocialAccountContentClass"), getClassName("kcFormSocialAccountClass")]
              )}
            >
              {realm.password && (
                <form id="kc-form-login" onSubmit={onSubmit} action={url.loginAction} method="post">
                  <div className="flex flex-1 flex-col gap-3">
                    <div className={getClassName("kcFormGroupClass")}>
                      {!usernameHidden &&
                        (() => {
                          const label = !realm.loginWithEmailAllowed
                            ? "username"
                            : realm.registrationEmailAsUsername
                              ? "email"
                              : "usernameOrEmail";

                          const autoCompleteHelper: typeof label = label === "usernameOrEmail" ? "username" : label;

                          return (
                            <>
                              <label htmlFor={autoCompleteHelper} className={clsx([getClassName("kcLabelClass"),])}>
                                {msg(label)}
                              </label>
                              <input
                                tabIndex={1}
                                id={autoCompleteHelper}
                                className={clsx([getClassName("kcInputClass"), 'flex flex-1 w-full border-b border-solid border-[#023b7e]'])}
                                //NOTE: This is used by Google Chrome auto fill so we use it to tell
                                //the browser how to pre fill the form but before submit we put it back
                                //to username because it is what keycloak expects.
                                name={autoCompleteHelper}
                                defaultValue={login.username ?? ""}
                                type="text"
                                autoFocus={true}
                                autoComplete="off"
                              />
                            </>
                          );
                        })()}
                    </div>
                    <div className={getClassName("kcFormGroupClass")}>
                      <label htmlFor="password" className={getClassName("kcLabelClass")}>
                        {msg("password")}
                      </label>
                      <input
                        tabIndex={2}
                        id="password"
                        className={clsx([getClassName("kcInputClass"), 'flex flex-1 w-full border-b border-solid border-[#023b7e]'])}
                        name="password"
                        type="password"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className={clsx(getClassName("kcFormGroupClass"), getClassName("kcFormSettingClass"), 'flex justify-between mt-2')}>
                    <div id="kc-form-options" >
                      {realm.rememberMe && !usernameHidden && (
                        <div className="checkbox">
                          <label className="flex items-center justify-center text-sm gap-1">
                            <input
                              tabIndex={3}
                              id="rememberMe"
                              name="rememberMe"
                              type="checkbox"
                              {...(login.rememberMe === "on"
                                ? {
                                  "checked": true
                                }
                                : {})}
                            />
                            {msg("rememberMe")}
                          </label>
                        </div>
                      )}
                    </div>
                    <div className={clsx(getClassName("kcFormOptionsWrapperClass"), "text-sm")}>
                      {realm.resetPasswordAllowed && (
                        <span>
                          <a tabIndex={5} href={url.loginResetCredentialsUrl}>
                            {msg("doForgotPassword")}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                  <div id="kc-form-buttons" className={getClassName("kcFormGroupClass")}>
                    <input
                      type="hidden"
                      id="id-hidden-input"
                      name="credentialId"
                      {...(auth?.selectedCredential !== undefined
                        ? {
                          "value": auth.selectedCredential
                        }
                        : {})}
                    />
                    <input
                      tabIndex={4}
                      className={clsx(
                        getClassName("kcButtonClass"),
                        getClassName("kcButtonPrimaryClass"),
                        getClassName("kcButtonBlockClass"),
                        getClassName("kcButtonLargeClass"),
                        'flex flex-1 items-center justify-center w-full rounded-sm px-4 py-2 bg-[#023b7e] text-white text-lg hover:cursor-pointer hover:bg-opacity-90 hover:transition-all mt-5'
                      )}
                      name="login"
                      id="kc-login"
                      type="submit"
                      value={msgStr("doLogIn")}
                      // value={msgStr("doLogIn")}
                      disabled={isLoginButtonDisabled}
                    />
                  </div>
                </form>
              )}
            </div>
            {realm.password && social.providers !== undefined && (
              <div
                id="kc-social-providers"
                className={clsx(getClassName("kcFormSocialAccountContentClass"), getClassName("kcFormSocialAccountClass"))}
              >
                <ul
                  className={clsx(
                    getClassName("kcFormSocialAccountListClass"),
                    social.providers.length > 4 && getClassName("kcFormSocialAccountDoubleListClass")
                  )}
                >
                  {social.providers.map(p => (
                    <li key={p.providerId} className={getClassName("kcFormSocialAccountListLinkClass")}>
                      <a href={p.loginUrl} id={`zocial-${p.alias}`} className={clsx("zocial", p.providerId)}>
                        <span>{p.displayName}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Template>
      </div>
    </div>
  );
}
